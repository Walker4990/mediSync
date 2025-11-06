package com.mediSync.project.patient.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class CancelDTO {
    private long cancelId;
    private long patientId;
    private long adminId;
    private LocalDateTime date;
    private LocalDateTime createdAt;
    private String reason;

    private long reservationId;
    private long scheduleId;
    private long operationId;

    private long id;
    private String type;

}
