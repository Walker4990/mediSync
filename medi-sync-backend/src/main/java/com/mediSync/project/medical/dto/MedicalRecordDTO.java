package com.mediSync.project.medical.dto;

import com.mediSync.project.medical.vo.Prescription;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Alias("medicalrecorddto")
public class MedicalRecordDTO {
    private Long recordId, patientId, adminId;
    private String patientName;
    private String diagnosis;
    private BigDecimal totalCost;
    private String status;
    private LocalDateTime createdAt;
    private BigDecimal insuranceAmount;
    private BigDecimal patientPay;

    private List<Prescription> prescriptions;

    private String doctorName;
    private String deptName;
    private Long reservationId;
    private String reservationStatus;
    private LocalDate reservationDate;

}
