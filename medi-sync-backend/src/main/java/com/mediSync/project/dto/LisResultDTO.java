package com.mediSync.project.dto;

import lombok.Data;

import java.util.Map;

@Data
public class LisResultDTO {
    private String testCode;
    private String testName;
    private Long patientId;
    private Long recordId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private Long reservationId;
    private Map<String, String> mockData;


}
