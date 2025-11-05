package com.mediSync.project.test.dto;

import lombok.Data;

import java.util.Map;

@Data
public class LisResultDTO {
    private String testCode;
    private String testName;
    private Long patientId;
    private Long recordId;
    private String patientName;
    private Long adminId;
    private String doctorName;
    private Long reservationId;
    private Map<String, String> mockData;


}
