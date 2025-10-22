package com.mediSync.project.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Alias("MedicalRecord")
public class MedicalRecord {
    private Long recordId, patientId, doctorId;
    private String patientName;
    private String diagnosis;
    private BigDecimal totalCost;
    private String status;
    private LocalDateTime createdAt;

    private List<Prescription> prescriptions;

    private String doctorName;
    private String department;
}
