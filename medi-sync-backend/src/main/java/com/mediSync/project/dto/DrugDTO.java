package com.mediSync.project.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DrugDTO {
    private String drugCode;
    private String drugName;
    private BigDecimal unitPrice;
    private int quantity;
    private String location;
    private LocalDateTime updatedAt;
    private String insurerCode;
    private String insurerName;
}

