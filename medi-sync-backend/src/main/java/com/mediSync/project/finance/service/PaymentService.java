package com.mediSync.project.finance.service;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.nio.charset.StandardCharsets;
import java.util.Base64;
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
    private final ObjectMapper objectMapper = new ObjectMapper();
    public Map<String, Object> createCheckout(Long patientId, Double amount) {

        String orderId = "ORD-" + System.currentTimeMillis();

        Payment p = new Payment();
        p.setPatientId(patientId);
        p.setAmount(amount);
        p.setOrderId(orderId);

        paymentMapper.insertPending(p);

        return Map.of(
                "orderId", orderId,
                "amount", amount
        );
    }


    // ----------------------------------------------------
    // 📌 2. Toss Webhook 처리
    // ----------------------------------------------------
    public void handleWebhook(Map<String, Object> payload) {

        log.info("🔥 FULL WEBHOOK PAYLOAD = {}", payload);

        Map<String, Object> data = (Map<String, Object>) payload.get("data");
        if (data == null) {
            log.error("❌ data 필드 없음 → Toss Webhook 아님");
            return;
        }

        String status = String.valueOf(data.get("status"));
        log.info("📨 Webhook status = {}", status);

        switch (status) {
            case "DONE":
            case "APPROVED":
            case "CONFIRMED":
            case "SUCCESS":
                processWebhook(data);
                break;

            case "CANCELED":
            case "PARTIAL_CANCELED":
            case "REFUNDED":
                processRefundWebhook(data);
                break;

            default:
                log.warn("⚠️ 처리 대상 아님 status={}", status);
        }
    }


    // ----------------------------------------------------
    // 📌 3. 결제 성공 webhook (data만 전달)
    // ----------------------------------------------------
    @Transactional
    public void processWebhook(Map<String, Object> data) {
        log.info("📩 Toss webhook data = {}", data);

        String paymentKey = String.valueOf(data.get("paymentKey"));
        String eventType = String.valueOf(data.get("eventType"));
        String orderId = String.valueOf(data.get("orderId"));
        Double amount = Double.valueOf(String.valueOf(data.get("amount")));

        String jsonPayload;
        try {
            jsonPayload = objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            jsonPayload = "{}";
        }

        // 중복 Webhook 방지
        if (webhookLogMapper.existsByPaymentKeyAndEventType(paymentKey, eventType) > 0) {
            log.warn("⚠️ 중복 webhook 무시: paymentKey={}, eventType={}", paymentKey, eventType);
            return;
        }

        webhookLogMapper.insertLog(paymentKey, eventType, jsonPayload);

        // DB 결제 조회
        Payment payment = paymentMapper.findByOrderId(orderId);
        if (payment == null) {
            log.error("❌ DB에 결제 정보 없음: orderId={}", orderId);
            return;
        }

        // 이미 SUCCESS면 무시
        if ("SUCCESS".equals(payment.getStatus())) {
            log.warn("⚠️ 이미 결제 완료된 주문: {}", orderId);
            return;
        }

        Long patientId = payment.getPatientId();

        // 결제 성공 업데이트
        Payment updateVo = new Payment();
        updateVo.setOrderId(orderId);
        updateVo.setPaymentKey(paymentKey);
        updateVo.setAmount(amount);
        updateVo.setPgProvider("WEBHOOK");
        updateVo.setStatus("SUCCESS");

        paymentMapper.updatePaymentSuccess(updateVo);

        // 미납 → 완료 처리
        financeTransactionMapper.updateCompletedByOrderId(orderId);

        // 새 재무기록 생성
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

        // 남은 미납 처리
        long unpaid = paymentMapper.findTotalUnpaidByPatientId(patientId);
        log.info("💰 남은 미납금: {}", unpaid);

        financeTransactionMapper.updateOldestPendingRecordByPatient(patientId);
    }


    // ----------------------------------------------------
    // 📌 4. 환불 webhook
    // ----------------------------------------------------
    @Transactional
    public void processRefundWebhook(Map<String, Object> data) {

        String orderId = String.valueOf(data.get("orderId"));
        String paymentKey = String.valueOf(data.get("paymentKey"));
        String cancelAmount = String.valueOf(data.get("cancelAmount"));
        String reason = String.valueOf(data.get("refundReason"));
        String eventType = String.valueOf(data.get("eventType"));
        Long refundId = Long.valueOf(String.valueOf(data.get("refundId")));

        String jsonPayload;
        try {
            jsonPayload = objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            jsonPayload = "{}";
        }

        // 중복 방지
        if (webhookLogMapper.existsByPaymentKeyAndEventType(paymentKey, eventType) > 0)
            return;

        webhookLogMapper.insertLog(paymentKey, eventType, jsonPayload);

        Payment payment = paymentMapper.findByOrderId(orderId);
        if (payment == null) return;

        // 결제 REFUNDED 처리
        paymentMapper.updatePaymentRefund(orderId);

        // refund_request COMPLETED 처리
        refundMapper.markCompleted(refundId);

        // 재무 기록 생성
        FinanceTransaction tx = new FinanceTransaction();
        tx.setRefType("REFUND");
        tx.setRefId(payment.getPaymentId());
        tx.setPatientId(payment.getPatientId());
        tx.setAmount(new BigDecimal(cancelAmount));
        tx.setType("EXPENSE");
        tx.setCategory("REFUND");
        tx.setDescription("결제 환불 - " + reason);
        tx.setStatus("COMPLETED");
        tx.setOrderId(orderId);

        financeTransactionMapper.insertFinance(tx);
    }


    // ----------------------------------------------------
    // 📌 5. 환불 승인 (관리자)
    // ----------------------------------------------------
    public void approveRefund(String paymentKey, double amount, String reason) {
        log.info("✅ approveRefund: paymentKey={}, amount={}, reason={}", paymentKey, amount, reason);
        tossRefund(paymentKey, amount, reason);
    }


    // ----------------------------------------------------
    // 📌 6. Toss 환불 API
    // ----------------------------------------------------
    public void tossRefund(String paymentKey, double amount, String reason) {

        String url = "https://api.tosspayments.com/v1/payments/" + paymentKey + "/cancel";

        String key = TOSS_SECRET + ":";
        String base64Key = Base64.getEncoder().encodeToString(key.getBytes(StandardCharsets.UTF_8));

        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Basic " + base64Key);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> payload = new HashMap<>();
        payload.put("cancelAmount", amount);   // FIX: 오타 수정
        payload.put("cancelReason", reason);

        RestTemplate restTemplate = new RestTemplate();
        restTemplate.postForEntity(url, new HttpEntity<>(payload, headers), String.class);

        log.info("✅ Toss 환불 API 호출 완료");
    }


    // ----------------------------------------------------
    // 📌 7. 결제 이력 조회
    // ----------------------------------------------------
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
