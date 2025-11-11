package com.mediSync.project.patient.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Alias("noshow")
public class NoShow {
    private long noshowId;
    private long patientId;
    private long adminId;
    private long typeId;
    private String type;
    private String email;
    private LocalDateTime scheduledAt;
    private String sendStatus;
    private Date sendTime;

}
