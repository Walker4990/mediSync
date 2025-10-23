package com.mediSync.project.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

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
    private LocalDateTime testDate;
    // 주사 처방
    private String injectionName;
    private int injectionCount;
    private String injectionArea;

    // 약 / 검사 / 주사
    private String type;
    private LocalDateTime createdAt;
}
