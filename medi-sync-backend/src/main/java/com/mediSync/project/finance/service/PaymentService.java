package com.mediSync.project.finance.service;

import com.mediSync.project.finance.mapper.FinanceTransactionMapper;
import com.mediSync.project.finance.mapper.PaymentMapper;
import com.mediSync.project.finance.vo.FinanceTransaction;
import com.mediSync.project.finance.vo.Payment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentMapper paymentMapper;
    private final FinanceTransactionMapper financeTransactionMapper;
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



    public Map<String, Object> getPaymentHistory(Long patientId){
        List<FinanceTransaction> history = paymentMapper.findByPatientId(patientId);

        FinanceTransaction unpaid = paymentMapper.findUnpaidByPatientId(patientId);

        return Map.of("history", history,
                    "unpaid", unpaid);
    }
}
