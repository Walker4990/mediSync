package com.mediSync.project.finance.controller;

import com.mediSync.project.finance.service.FinanceTransactionService;
import com.mediSync.project.finance.vo.FinanceTransaction;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/finance")
public class FinanceTransactionController {
    private final FinanceTransactionService financeTransactionService;

    @GetMapping("/list")
    public List<FinanceTransaction> selectAll( @RequestParam(required = false) String type,
                                               @RequestParam(required = false) String category,
                                               @RequestParam(required = false) String status,
                                               @RequestParam(required = false) String startDate,
                                               @RequestParam(required = false) String endDate,
                                               @RequestParam(defaultValue = "desc") String sort){

        Map<String, Object> filters = new HashMap<>();
        filters.put("type", type);
        filters.put("category", category);
        filters.put("status", status);
        filters.put("startDate", startDate);
        filters.put("endDate", endDate);
        filters.put("sort", sort);
        return financeTransactionService.selectAll(filters);
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getFinanceSummary(){
        return ResponseEntity.ok(financeTransactionService.getDashboardSummary());
    }
}
