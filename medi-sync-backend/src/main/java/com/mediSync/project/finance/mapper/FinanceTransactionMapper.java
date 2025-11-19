package com.mediSync.project.finance.mapper;

import com.mediSync.project.finance.vo.FinanceTransaction;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface FinanceTransactionMapper {
    int insertFinance(FinanceTransaction ft);
    void updateFinance(FinanceTransaction ft);
    FinanceTransaction findByRef(Long refId, String refType);
    List<FinanceTransaction> selectAll(Map<String,Object> filters);
    List<Map<String, Object>> getDailyFinance();
    List<Map<String, Object>> getStatusSummary();
    int updateCompletedByOrderId(@Param("orderId") String orderId);
    int updateOldestPendingRecordByPatient(@Param("patientId") Long patientId);
}
