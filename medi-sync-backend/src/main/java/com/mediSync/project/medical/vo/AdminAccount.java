package com.mediSync.project.medical.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("admin")
public class AdminAccount {
    private Long adminId, deptId;
    private String name, phone, empId, password, email, role, position, profileImgUrl, licenseNo, status;
    private LocalDate hiredDate;
    private LocalDateTime createdAt;
}
