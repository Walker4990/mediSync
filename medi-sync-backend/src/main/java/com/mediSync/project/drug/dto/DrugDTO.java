package com.mediSync.project.drug.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class DrugDTO {
    private String drugCode;
    private String drugName;
    private BigDecimal unitPrice;
    private BigDecimal purchasePrice;
    private int quantity;
    private String location;
    private String unit;
    private String supplier;
    private String lotNo;
    private LocalDateTime updatedAt;
    private String insurerCode;
    private LocalDate expirationDate;
    private String insurerName;
    private String insuranceCode;
}

