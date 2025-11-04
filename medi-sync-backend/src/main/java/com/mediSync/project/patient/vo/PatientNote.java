package com.mediSync.project.patient.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("note")
public class PatientNote {
    private Long noteId;
    private Long patientId;
    private String patientName;
    private Long admissionId;
    private Long staffId;
    private String staffName;
    private String noteType;
    private String content;
    private String visibility;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
