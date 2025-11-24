package com.mediSync.project.finance.mapper;

import com.mediSync.project.finance.vo.BudgetExecutionLog;
import com.mediSync.project.finance.vo.BudgetPlan;
import org.apache.ibatis.annotations.Mapper;

import java.math.BigDecimal;
import java.util.Map;

@Mapper
public interface BudgetMapper {
    // 1) 예산 편성 저장
    int insertBudgetPlan(BudgetPlan plan);

    // 2) 특정 부서의 특정 월 예산 조회
    BudgetPlan findBudgetPlan(Map<String, Object> param);

    // 3) 예산 집행 로그 저장
    int insertExecutionLog(BudgetExecutionLog log);

    // 4) 예산 집행 총합 조회
    BigDecimal sumExecutedAmount(Long budgetId);
}
