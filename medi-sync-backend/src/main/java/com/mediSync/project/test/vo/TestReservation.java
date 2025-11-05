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
@Alias("testReservation")
public class TestReservation {

    private Long reservationId;
    private Long scheduleId;
    private Long patientId;
    private Long recordId;
    private Long adminId;
    private String status;
    private LocalDateTime reservedAt;

    // 조인 컬럼
    private String testGroup;
    private String testCode;
    private String patientName;
    private String testName;
    private LocalDate testDate;
    private String testTime;

}
