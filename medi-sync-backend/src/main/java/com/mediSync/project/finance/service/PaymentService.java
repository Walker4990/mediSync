package com.mediSync.project.finance.service;

import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Font;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;
import com.mediSync.project.finance.mapper.FinanceTransactionMapper;
import com.mediSync.project.finance.mapper.PaymentMapper;
import com.mediSync.project.finance.vo.FinanceTransaction;
import com.mediSync.project.finance.vo.Payment;
import com.mediSync.project.patient.mapper.PatientMapper;
import com.mediSync.project.patient.vo.Patient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentMapper paymentMapper;
    private final FinanceTransactionMapper financeTransactionMapper;
    private final PatientMapper patientMapper;
    // toss API key
    private final String TOSS_SECRET = "test_sk_ma60RZblrqoaLvBo6j2R3wzYWBn1";

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

    public void handleWebhook(Map<String, Object> payload){
        String orderId = payload.get("orderId").toString();
        String paymentKey = payload.get("paymentKey").toString();
        String method = payload.get("method").toString();
        Double amount = Double.parseDouble(payload.get("totalAmount").toString());

        // DB 조회 (Payment VO)
        Payment payment = paymentMapper.findByOrderId(orderId);
        Long patientId = payment.getPatientId();

        // ✔ updatePaymentSuccess(Map → Payment VO로 변경) ← 이것만 필수
        Payment updateVo = new Payment();
        updateVo.setOrderId(orderId);
        updateVo.setPaymentKey(paymentKey);
        updateVo.setAmount(amount);
        updateVo.setPgProvider(method);  // method → pgProvider 그대로
        updateVo.setStatus("SUCCESS");
        System.out.println("WEBHOOK PAYLOAD = " + payload);
        paymentMapper.updatePaymentSuccess(updateVo);

        // finance insert (너 구조 그대로)
        FinanceTransaction ft = new FinanceTransaction();
        ft.setRefType("PAYMENT");
        ft.setRefId(payment.getPaymentId());   // Map 아니고 VO니까 이렇게
        ft.setPatientId(patientId);
        ft.setAmount(BigDecimal.valueOf(amount));
        ft.setType("INCOME");
        ft.setDescription("수납");
        ft.setStatus("COMPLETED");

        financeTransactionMapper.insertFinance(ft);
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
