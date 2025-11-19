package com.mediSync.project.finance.controller;

import com.mediSync.project.finance.dto.PaymentRequest;
import com.mediSync.project.finance.mapper.PaymentMapper;
import com.mediSync.project.finance.service.PaymentService;
import com.mediSync.project.finance.vo.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
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

    @PostMapping({"/webhook", "/toss/webhook"})
    public ResponseEntity<?> webhook(@RequestBody Map<String, Object> payload){
        log.info("📩 [Webhook] Controller 진입");
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

    @GetMapping("/receipt/{orderId}")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable String orderId){
        byte[] pdf = paymentService.generatePaymentReceipt(orderId);

        return ResponseEntity.ok().header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=receipt-" + orderId + ".pdf")
                .body(pdf);
    }
}
