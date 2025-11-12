package com.mediSync.project.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimItemDto {
    private String itemName;
    private BigDecimal amount;
}
