package com.mediSync.project.finance.service;

import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Font;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;
import com.mediSync.project.finance.mapper.FinanceTransactionMapper;
import com.mediSync.project.finance.mapper.PaymentMapper;
import com.mediSync.project.finance.mapper.RefundMapper;
import com.mediSync.project.finance.mapper.WebhookLogMapper;
import com.mediSync.project.finance.vo.FinanceTransaction;
import com.mediSync.project.finance.vo.Payment;
import com.mediSync.project.finance.vo.WebhookLog;
import com.mediSync.project.patient.mapper.PatientMapper;
import com.mediSync.project.patient.vo.Patient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@Transactional(value = "transactionManager", propagation = Propagation.REQUIRED)
@RequiredArgsConstructor
public class PaymentService {

    private final RefundMapper refundMapper;
    private final WebhookLogMapper webhookLogMapper;
    private final PaymentMapper paymentMapper;
    private final FinanceTransactionMapper financeTransactionMapper;
    private final PatientMapper patientMapper;
    // toss API key
    private final String TOSS_SECRET = "test_sk_ma60RZblrqoaLvBo6j2R3wzYWBn1";
    private final ApplicationContext context;

    public Map<String, Object> createCheckout(Long patientId, Double amount) {

        String orderId = "ORD-" + System.currentTimeMillis();

        Payment p = new Payment();
        p.setPatientId(patientId);
        p.setAmount(amount);
        p.setOrderId(orderId);

        paymentMapper.insertPending(p);

        return Map.of("orderId", orderId,
                "amount", amount);
    }
    public void handleWebhook(Map<String, Object> payload) {
        String eventType = String.valueOf(payload.get("eventType"));
        log.info("📨 Webhook eventType = {}", eventType);

        switch (eventType) {
            case "PAYMENT_STATUS_CHANGED":
            case "PAYMENT_CONFIRMED":
            case "PAYMENT_SUCCESS":
                processWebhook(payload);
                break;

            case "PAYMENT_REFUNDED":
                processRefundWebhook(payload);
                break;

            default:
                log.warn("⚠️ 처리 대상 아님: eventType={}", eventType);
                break;
        }
    }

    @Transactional
    public void processWebhook(Map<String, Object> payload) {
        log.info("📩 Toss webhook payload = {}", payload);

        // 1️⃣ 데이터 파싱 (Toss Webhook 구조 기준)
        Map<String, Object> data = (Map<String, Object>) payload.get("data");
        if (data == null) {
            log.error("❌ payload.data is null");
            return;
        }

        String paymentKey = String.valueOf(data.get("paymentKey"));
        String eventType = String.valueOf(payload.get("eventType"));
        String orderId = String.valueOf(data.get("orderId"));
        String status = String.valueOf(data.get("status"));
        String method = "WEBHOOK";

        // 2️⃣ 중복 Webhook 방지
        if (webhookLogMapper.existsByPaymentKeyAndEventType(paymentKey, eventType) > 0) {
            log.warn("⚠️ 중복 webhook 무시: paymentKey={}, eventType={}", paymentKey, eventType);
            return;
        }

        // 3️⃣ 로그 기록 (항상 성공하도록 트랜잭션 안에서)
        webhookLogMapper.insertLog(paymentKey, eventType, payload.toString());

        // 4️⃣ 결제 정보 조회
        Payment payment = paymentMapper.findByOrderId(orderId);
        if (payment == null) {
            log.error("❌ DB에서 결제 정보 없음: orderId={}", orderId);
            return;
        }

        // 5️⃣ 이미 처리된 결제면 무시
        if ("SUCCESS".equals(payment.getStatus())) {
            log.warn("⚠️ 이미 결제 완료된 주문: {}", orderId);
            return;
        }

        Double amount = payment.getAmount();
        Long patientId = payment.getPatientId();

        // 6️⃣ 결제 성공 처리
        Payment updateVo = new Payment();
        updateVo.setOrderId(orderId);
        updateVo.setPaymentKey(paymentKey);
        updateVo.setAmount(amount);
        updateVo.setPgProvider(method);
        updateVo.setStatus("SUCCESS");

        paymentMapper.updatePaymentSuccess(updateVo);

        // 7️⃣ 재무 거래 완료 처리
        int updated = financeTransactionMapper.updateCompletedByOrderId(orderId);
        log.info("💰 미납→완료 업데이트 결과: {}건", updated);

        FinanceTransaction ft = new FinanceTransaction();
        ft.setRefType("PAYMENT");
        ft.setRefId(payment.getPaymentId());
        ft.setPatientId(patientId);
        ft.setAmount(BigDecimal.valueOf(amount));
        ft.setType("INCOME");
        ft.setDescription("수납");
        ft.setStatus("COMPLETED");
        ft.setOrderId(orderId);
        financeTransactionMapper.insertFinance(ft);

        // 8️⃣ 미납 처리 업데이트
        long unpaid = paymentMapper.findTotalUnpaidByPatientId(patientId);
        log.info("💰 결제 완료: {} / 남은 미납금 {}", orderId, unpaid);

        int cleared = financeTransactionMapper.updateOldestPendingRecordByPatient(patientId);
        log.info("🧾 미납(RECORD) 처리 결과: {}건 완료", cleared);
    }

    @Transactional
    public void processRefundWebhook(Map<String, Object> payload) {

        Map<String, Object> data = (Map<String, Object>) payload.get("data");
        if (data == null) return;

        String orderId = String.valueOf(data.get("orderId"));
        String paymentKey = String.valueOf(data.get("paymentKey"));
        String cancelAmount = String.valueOf(data.get("cancelAmount"));
        String reason = String.valueOf(data.get("refundReason"));
        String eventType = String.valueOf(data.get("eventType"));
        Long refundId = Long.valueOf(String.valueOf(data.get("refundId")));
        // 중복 웹훅 방지
        if (webhookLogMapper.existsByPaymentKeyAndEventType(paymentKey, eventType) > 0) return;
        webhookLogMapper.insertLog(paymentKey, eventType, payload.toString());

        Payment payment = paymentMapper.findByOrderId(orderId);
        if (payment == null) return;

        // 결제 상태 REFUNDED 처리
        paymentMapper.updatePaymentRefund(orderId);

        // refund_request COMPLETED 처리 (중요)
        refundMapper.markCompleted(refundId);

        // 재무 기록 추가
        FinanceTransaction tx = new FinanceTransaction();
        tx.setRefType("REFUND");
        tx.setRefId(payment.getPaymentId());
        tx.setPatientId(payment.getPatientId());
        tx.setAmount(new BigDecimal(cancelAmount));
        tx.setType("EXPENSE");   // ← 통일
        tx.setCategory("REFUND");
        tx.setDescription("결제 환불 - " + reason);
        tx.setStatus("COMPLETED");
        tx.setOrderId(orderId);

        financeTransactionMapper.insertFinance(tx);
    }

    public void apporveRefund(String orderId) {
        Payment payment = paymentMapper.findByOrderId(orderId);
        if(payment == null) throw new IllegalStateException("결제 없음");

        tossRefund(
                payment.getPaymentKey(),
                payment.getAmount(),
                "관리자 승인 환불"
        );

    }


    public void tossRefund(String paymentKey, double amount, String reason) {
        String url = "https://api.tosspayments.com/v1/payments/" + paymentKey + "/cancel";

        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(TOSS_SECRET);   // 중요
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> payload = new HashMap<>();
        payload.put("cancelAmount", amount);
        payload.put("cancelReason", reason);

        RestTemplate rest = new RestTemplate();
        rest.postForEntity(url, new HttpEntity<>(payload, headers), String.class);
    }




    public Map<String, Object> getPaymentHistory(Long patientId) {
        Map<String, Object> result = new HashMap<>();

        List<FinanceTransaction> history = paymentMapper.findByPatientId(patientId);
        result.put("history", history);

        Long unpaidTotal = paymentMapper.findTotalUnpaidByPatientId(patientId);
        result.put("unpaid", unpaidTotal);
        List<FinanceTransaction> unpaidList = paymentMapper.findUnpaidListByPatientId(patientId);
        result.put("unpaidList", unpaidList);
        return result;
    }

    public byte[] generatePaymentReceipt(String orderId) {
        Payment p = paymentMapper.findByOrderId(orderId);
        Patient patient = patientMapper.getPatientDetail(p.getPatientId());

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document();

        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();

            Font title = new Font(Font.FontFamily.HELVETICA, 20, Font.BOLD);
            Font normal = new Font(Font.FontFamily.HELVETICA, 12);

            doc.add(new Paragraph("진료비 영수증", title));
            doc.add(new Paragraph(" "));

            doc.add(new Paragraph("환자명: " + patient.getName(), normal));
            doc.add(new Paragraph("결제일: " + p.getSuccessAt(), normal));
            doc.add(new Paragraph("결제 금액: " + String.format("%,d원", p.getAmount().intValue()), normal));
            doc.add(new Paragraph("결제 수단: 카드", normal));
            doc.add(new Paragraph("거래번호(Order ID): " + p.getOrderId(), normal));
            doc.add(new Paragraph("PG사 번호(Payment key): " + p.getPaymentKey(), normal));

            doc.add(new Paragraph("\n감사합니다.", normal));


        } catch (Exception e) {
            throw new RuntimeException("영수증 발행 실패", e);
        } finally {
            doc.close();
        }
        return baos.toByteArray();
    }
}
