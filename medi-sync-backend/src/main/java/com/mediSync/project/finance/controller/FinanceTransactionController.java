package com.mediSync.project.finance.controller;

import com.mediSync.project.finance.mapper.FinanceTransactionMapper;
import com.mediSync.project.finance.service.FinanceTransactionService;
import com.mediSync.project.finance.vo.FinanceTransaction;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/finance")
public class FinanceTransactionController {
    private final FinanceTransactionService financeTransactionService;
    private final FinanceTransactionMapper  financeTransactionMapper;

    @GetMapping("/list")
    public Map<String, Object> selectAll( @RequestParam(required = false) String type,
                                               @RequestParam(required = false) String category,
                                               @RequestParam(required = false) String status,
                                               @RequestParam(required = false) String startDate,
                                               @RequestParam(required = false) String endDate,
                                               @RequestParam(defaultValue = "desc") String sort,
                                               @RequestParam(defaultValue = "1") int page,
                                               @RequestParam(defaultValue = "20") int size
    ){

        Map<String, Object> filters = new HashMap<>();
        filters.put("type", type);
        filters.put("category", category);
        filters.put("status", status);
        filters.put("startDate", startDate);
        filters.put("endDate", endDate);
        filters.put("sort", sort);
        return financeTransactionService.selectAll(filters, page, size);
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getFinanceSummary(){
        return ResponseEntity.ok(financeTransactionService.getDashboardSummary());
    }

    @GetMapping("/dept-income")
    public List<Map<String, Object>> getDeptIncomeSummary() {
        return financeTransactionService.getDeptIncomeSummary();
    }

    // 📌 부서별 순이익 집계
    @GetMapping("/dept-net-profit")
    public List<Map<String, Object>> getDeptNetProfit() {
        return financeTransactionService.getDeptNetProfit();
    }
    @GetMapping("/unpaid/list")
    public List<FinanceTransaction> getUnpaidPatientsList() {
        return financeTransactionMapper.getUnpaidPatients();
    }
    @GetMapping("/unpaid/{patientId}")
    public List<FinanceTransaction> getUnpaidPatient(@PathVariable Long patientId) {
        return financeTransactionMapper.getUnpaidDetails(patientId);
    }
    @GetMapping("/unpaid/alert/{patientId}")
    public Map<String, Object> getUnpaid(@PathVariable Long patientId) {
        return financeTransactionService.getUnpaidInfo(patientId);
    }
    @PostMapping("/unpaid/notify/{patientId}")
    public ResponseEntity<?> notifyUnpaid(@PathVariable Long patientId) {
        financeTransactionService.sendUnpaidEmail(patientId);
        return ResponseEntity.ok("Email sent");
    }
}
