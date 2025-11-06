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
@Alias("adminAccount")
public class AdminAccount {
    private Long adminId;
    private String empId;
    private String password;
    private String name;
    private String phone;
    private String email;
    private String position;
    private String role;
    private String profileImgUrl;
    private Long deptId;
    private String licenseNo;
    private String status;
    private LocalDate hiredDate;
    private LocalDateTime createdAt;
    private String deptName;
}
