package com.mediSync.project.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Alias("acc")
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

    private Long userId;
    private String loginId;
    private String provider;    // 예: "naver", "kakao"
    private String providerId;  // 예: "naver_123456" (서비스명 + 고유ID)

}