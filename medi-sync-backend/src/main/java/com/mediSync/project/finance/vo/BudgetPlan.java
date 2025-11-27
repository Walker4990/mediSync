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
@Alias("budget")
public class BudgetPlan {
    private Long budgetId;
    private Long deptId;
    private int year;
    private int month;
    private BigDecimal amount;
    private LocalDateTime createdAt;

}
