package com.mediSync.project.test.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("testResult")
public class TestResult {
    private Long testResultId;
    private Long recordId;
    private Long patientId;
    private Long doctorId;
    private String testCode;
    private String testName;
    private String testArea;
    private LocalDate testDate;
    private String resultValue;
    private String resultNote;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String patientName;
    private String doctorName;
}
