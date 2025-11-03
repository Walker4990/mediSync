package com.mediSync.project.room.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("admission")
public class Admission {
    private Long admissionId;
    private Long patientId;
    private Long operationId;
    private Long roomId;
    private LocalDateTime admittedAt;
    private LocalDateTime dischargedAt;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String patientName;
    private String wardName;
    private String roomNo;
    private String nurseInCharge;
    private int capacity;
    private int currentCount;

}
