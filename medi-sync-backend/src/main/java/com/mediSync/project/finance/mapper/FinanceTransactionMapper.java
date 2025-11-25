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
    List<FinanceTransaction> selectAll(Map<String,Object> filters, @Param("offset") int offset, @Param("size") int size);

    int updateCompletedByOrderId(@Param("orderId") String orderId);
    int updateOldestPendingRecordByPatient(@Param("patientId") Long patientId);

    List<FinanceTransaction> getUnpaidPatients();
    List<FinanceTransaction> getUnpaidDetails(@Param("patientId") Long patientId);
    int getUnpaidTotal(Long patientId);
    Map<String, Object> getUnpaidSummary(@Param("patientId") Long patientId);
    //대시 보드
    List<Map<String, Object>> getDailyFinance();
    List<Map<String, Object>> getStatusSummary();
    List<Map<String, Object>> getDeptIncomeSummary();
    List<Map<String, Object>> getDeptNetProfit();
    int countAll(@Param("filters") Map<String, Object> filters);
}
