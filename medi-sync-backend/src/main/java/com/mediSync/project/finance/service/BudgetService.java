package com.mediSync.project.finance.service;

import com.mediSync.project.finance.mapper.BudgetMapper;
import com.mediSync.project.finance.vo.BudgetExecutionLog;
import com.mediSync.project.finance.vo.BudgetPlan;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BudgetService {
    private final BudgetMapper budgetMapper;

    public int insertBudget(BudgetPlan bp) {
        return budgetMapper.insertBudgetPlan(bp);
    }

    public BudgetPlan getBudgetPlan(Long deptId, int year, int month) {
        Map<String, Object> param = new HashMap<>();
        param.put("deptId", deptId);
        param.put("year", year);
        param.put("month", month);

        return budgetMapper.findBudgetPlan(param);
    }

    public void recordExecuttion(Long deptId, BigDecimal amount, String recordType, Long recordId) {

        // 현재 월 예산 찾기
        int year = java.time.LocalDate.now().getYear();
        int month = java.time.LocalDate.now().getMonthValue();

        BudgetPlan plan = getBudgetPlan(deptId, year, month);
        if (plan == null) return;

        BudgetExecutionLog log = new BudgetExecutionLog();
        log.setBudgetId(plan.getBudgetId());
        log.setDeptId(deptId);
        log.setAmount(amount);
        log.setRecordType(recordType);
        log.setRecordId(recordId);
        budgetMapper.insertExecutionLog(log);
    }

    // 4) 예산 사용 현황 조회
    public BigDecimal getUsedAmount(Long budgetId) {
        return budgetMapper.sumExecutedAmount(budgetId);
    }
}
