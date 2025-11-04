package com.mediSync.project.room.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Alias("history")
public class AdmissionHistory {
    private Long historyId;
    private Long patientId;
    private Long roomId;
    private String patientName;
    private String roomNo;
    private String wardName;
    private LocalDateTime admissionDate;
    private LocalDateTime dischargeDate;
    private String reason;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
