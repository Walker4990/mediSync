package com.mediSync.project.medical.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("admin")
public class AdminAccount {
    private Long adminId;
    private Long doctorId, staffId;
    private String name, phone, empId, password, email, role, profileImgUrl;
    private LocalDateTime createdAt;

    private Doctor doctor;
    private MedicalStaff medicalStaff;
}
