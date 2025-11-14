package com.mediSync.project.finance.mapper;

import com.mediSync.project.finance.vo.FinanceTransaction;
import com.mediSync.project.finance.vo.Payment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PaymentMapper {
    List<FinanceTransaction> findByPatientId(Long patientId);
    FinanceTransaction findUnpaidByPatientId(Long patientId);
    int insertPending(Payment payment);

    Payment findByOrderId(@Param("orderId") String orderId);

    int updatePaymentSuccess(Payment payment);

}
