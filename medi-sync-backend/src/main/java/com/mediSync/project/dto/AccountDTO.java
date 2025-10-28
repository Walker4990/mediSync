package com.mediSync.project.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("account")
public class AccountDTO {
    private Long adminId; // AI PK
    private String empId;
    private String password;
    private String name;
    private String phone;
    private String email;
    private String role; // ENUM('USER','ADMIN')
    private String profileImgUrl;
    private Long doctorId;
    private Long staffId;
    private LocalDateTime createdAt;
}