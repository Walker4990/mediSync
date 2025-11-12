package com.mediSync.project.insurance.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientInsurance {
    private Long patientInsuranceId;
    private Long patientId;
    private String insurerCode;
    private String insuNum;
    private String pordName;
    private BigDecimal coverageRate;
    private LocalDate issueDate;
    private LocalDate expDate;
    private String insuType;
    private String insuStatus;
    private LocalDateTime syncedAt;
}
