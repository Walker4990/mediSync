package com.mediSync.project.finance.mapper;

import com.mediSync.project.finance.vo.RefundRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RefundMapper {
    void insertRefundRequest(RefundRequest req);
    void updateStatus(@Param("orderId") String orderId, @Param("status") String status);
    RefundRequest findByorderId(@Param("orderId") String orderId);

    List<RefundRequest> findAll();
    RefundRequest findByRefundId(@Param("refundId") Long refundId);

    int approve(Long refundId);
    int reject(Long refundId);

    int markCompleted(Long refundId);
}
