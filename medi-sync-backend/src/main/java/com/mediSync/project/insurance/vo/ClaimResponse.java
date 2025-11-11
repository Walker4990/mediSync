package com.mediSync.project.insurance.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClaimResponse {
    private Long claimId;
    private BigDecimal paidAmount;
    private String resultCode;
    private LocalDateTime paidDate;
    private String message;
}
