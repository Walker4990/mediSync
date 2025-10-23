package com.mediSync.project.vo;

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

    // 약 처방
    private String drugName;
    private String dosage;
    private String duration;

    // 검사 처방
    private String testName;
    private String testArea;
    private LocalDate testDate; // ✅ LocalDate로 변경

    // 주사 처방
    private String injectionName;
    private Integer injectionCount;
    private String injectionArea;

    // 공통 필드
    private String type; // DRUG / TEST / INJECTION
    private String unit; // ✅ 프론트에서 보냄 (정, 주사 등)
    private BigDecimal unitPrice; // ✅ 프론트에서 보냄
    private LocalDateTime createdAt;
}
