package com.mediSync.project.finance.service;

import com.mediSync.project.finance.mapper.FinanceTransactionMapper;
import com.mediSync.project.finance.mapper.PaymentMapper;
import com.mediSync.project.finance.mapper.RefundMapper;
import com.mediSync.project.finance.vo.FinanceTransaction;
import com.mediSync.project.finance.vo.Payment;
import com.mediSync.project.finance.vo.RefundRequest;
import lombok.RequiredArgsConstructor;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RefundService {

    private final RefundMapper refundMapper;
    private final PaymentMapper paymentMapper;
    private final FinanceTransactionMapper financeTransactionMapper;
    private final PaymentService paymentService;

    public void insertRefundRequest(RefundRequest req) {
        refundMapper.insertRefundRequest(req);
    }

    public RefundRequest findByorderId(@Param("orderId") String orderId) {
        return refundMapper.findByorderId(orderId);
    }

    public List<RefundRequest> findAll(){
        return  refundMapper.findAll();
    }

    @Transactional
    public void approve(Long refundId) {


        RefundRequest req = refundMapper.findById(refundId);
        if (req == null) throw new IllegalStateException("요청이 존재하지 않음");
        if (!"PENDING".equals(req.getStatus())) throw new IllegalStateException("이미 처리된 요청");

        Payment payment = paymentMapper.findByOrderId(req.getOrderId());
        if (payment == null) throw new IllegalStateException("해당 주문의 결제 정보 없음");

        // 1) 승인 상태 변경 (APPROVED)
        refundMapper.approve(refundId);

        // 2) Toss 환불 요청 (환불 처리 시작)
        paymentService.apporveRefund(req.getOrderId());
    }

    @Transactional
    public void reject(Long refundId) {
        refundMapper.reject(refundId);
    }


}
