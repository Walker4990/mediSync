package com.mediSync.project.finance.controller;

import com.mediSync.project.finance.mapper.FinanceTransactionMapper;
import com.mediSync.project.finance.service.BudgetService;
import com.mediSync.project.finance.vo.BudgetPlan;
import com.mediSync.project.finance.vo.FinanceTransaction;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/budget")
public class BudgetController {

    private final BudgetService budgetService;
    private final FinanceTransactionMapper financeTransactionMapper;

    // 1) 예산 편성
    @PostMapping("/create")
    public ResponseEntity<?> createBudget(@RequestBody BudgetPlan plan) {
        int ok = budgetService.insertBudget(plan);
        return ok > 0 ? ResponseEntity.ok("예산 편성 완료")
                : ResponseEntity.badRequest().body("예산 편성 실패");
    }

    // 2) 부서별 월 예산 조회
    @GetMapping("/{deptId}/{year}/{month}")
    public ResponseEntity<?> getBudget(
            @PathVariable Long deptId,
            @PathVariable int year,
            @PathVariable int month
    ) {
        return ResponseEntity.ok(budgetService.getBudgetPlan(deptId, year, month));
    }

}


