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
    private long cancel_id;
    private long patient_id;
    private long admin_id;
    private LocalDateTime date;
    private LocalDateTime created_at;
    private String reason;

    private long reservation_id;
    private long schedule_id;
    private long operation_id;

    private long id;
    private String type;

}
