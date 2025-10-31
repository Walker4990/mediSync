package com.mediSync.project.medical.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("medicalStaff")
public class MedicalStaff {
    private Long staffId;
    private String staffName, department, licenseNo, phone;
    private StaffPosition position;
    private StaffStatus status;
    private LocalDate hiredDate;
    private LocalDateTime createdAt;

    public enum StaffPosition {
        NURSE, RADIOLOGIST, LAB_TECH, ASSISTANT, ADMIN
    }

    public enum StaffStatus {
        ACTIVE, LEAVE, RETIRED
    }
}
