package com.mediSync.project.finance.mapper;

import com.mediSync.project.finance.vo.FinanceTransaction;
import org.apache.ibatis.annotations.Mapper;

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
}
