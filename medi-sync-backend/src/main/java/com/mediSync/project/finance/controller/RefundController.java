package com.mediSync.project.finance.controller;

import com.mediSync.project.finance.service.PaymentService;
import com.mediSync.project.finance.service.RefundService;
import com.mediSync.project.finance.vo.RefundRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/refund")
public class RefundController {
    private final RefundService refundService;
    private final PaymentService paymentService;
    // 고객이 환불 요청
    @PostMapping("/request")
    public ResponseEntity<?> requestRefund(@RequestBody RefundRequest req) {
        System.out.println(req.getOrderId());
        refundService.insertRefundRequest(req);
        return  ResponseEntity.ok("환불 요청 접수 완료");
    }
    // 관리자가 환불 승인
    @PostMapping("/approve/{refundId}")
    public ResponseEntity<?> approveRefund(@RequestBody Map<String, String> body) {
        String orderId = body.get("orderId");
        paymentService.apporveRefund(orderId);
        return ResponseEntity.ok("환불 완료");
    }
    @GetMapping("/list")
    public List<RefundRequest> findAll(){
        return refundService.findAll();
    }
    /** 4️⃣ 환불 거절 */
    @PostMapping("/reject/{refundId}")
    public ResponseEntity<?> rejectRefund(@PathVariable Long refundId) {

        refundService.reject(refundId);

        return ResponseEntity.ok("환불 거절 완료");
    }
}

