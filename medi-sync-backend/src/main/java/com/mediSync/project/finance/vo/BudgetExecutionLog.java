package com.mediSync.project.finance.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("budgetLog")
public class BudgetExecutionLog {
    private Long execId;
    private Long budgetId;
    private Long deptId;
    private String recordType;
    private Long recordId;
    private BigDecimal amount;
    private LocalDateTime createdAt;
}
