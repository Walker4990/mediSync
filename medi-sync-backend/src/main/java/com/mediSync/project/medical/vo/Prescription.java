package com.mediSync.project.medical.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("prescription")
public class Prescription {
    private Long prescriptionId;
    private Long recordId;
    private Long patientId;

    // 약 처방
    private String drugCode;
    private String drugName;
    private int dosage;
    private int duration;

    // 검사 처방
    private String testCode;
    private String testName;
    private String testArea;
    private LocalDate testDate;
    private String testTime;

    // 주사 처방
    private String injectionName;
    private Integer injectionCount;
    private String injectionArea;

    // 공통 필드
    private String type; // DRUG / TEST / INJECTION
    private String unit;
    private BigDecimal unitPrice;
    private LocalDateTime createdAt;
    private String doctorName;
    private String patientName;
}
