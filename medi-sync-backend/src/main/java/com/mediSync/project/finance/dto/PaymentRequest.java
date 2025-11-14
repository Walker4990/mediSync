package com.mediSync.project.finance.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private Long patientId;
    private Double amount;
}
