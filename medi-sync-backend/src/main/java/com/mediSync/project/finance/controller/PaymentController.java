package com.mediSync.project.finance.controller;

import com.mediSync.project.finance.dto.PaymentRequest;
import com.mediSync.project.finance.mapper.PaymentMapper;
import com.mediSync.project.finance.service.PaymentService;
import com.mediSync.project.finance.vo.Payment;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentMapper paymentMapper;

    @GetMapping("/history/{patientId}")
    public ResponseEntity<?> getHistory(@PathVariable Long patientId){
        return ResponseEntity.ok(paymentService.getPaymentHistory(patientId));
    }

    @PostMapping("/prepare")
    public ResponseEntity<?> preparePayment(@RequestBody PaymentRequest req) {

        // 서비스에서 orderId, amount를 리턴하도록 변경해야 함
        Map<String, Object> checkoutInfo = paymentService.createCheckout(
                req.getPatientId(),
                req.getAmount()
        );

        return ResponseEntity.ok(checkoutInfo);
    }

    @PostMapping("/toss/webhook")
    public ResponseEntity<?> webhook(@RequestBody Map<String, Object> payload){
        paymentService.handleWebhook(payload);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/status/{orderId}")
    public Map<String, Object> getPaymentStatus(@PathVariable String orderId){
        Payment p = paymentMapper.findByOrderId(orderId);

        Map<String, Object> result = new HashMap<>();
        result.put("status", p.getStatus());
        result.put("amount", p.getAmount());

        return result;
    }
}
