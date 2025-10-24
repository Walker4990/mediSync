package com.mediSync.project.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class TestScheduleDTO {
    private Long scheduleId;
    private String testCode;
    private String testName;
    private LocalDate testDate;
    private int capacity;
    private int reserved;
    private String status;

}
