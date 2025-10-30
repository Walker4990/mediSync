package com.mediSync.project.test.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TestFee {
    private String testCode;
    private String testName;
    private Long departmentId;
    private BigDecimal basePrice;
    private BigDecimal insuranceRate;
    private LocalDate createdAt;
    private LocalDate updatedAt;
}
