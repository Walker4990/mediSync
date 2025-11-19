package com.mediSync.project.medical.vo;

import com.mediSync.project.patient.vo.Patient;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("user")
public class UserAccount {
    private Long userId;
    private String name, phone, loginId, role, email, social;
    private LocalDateTime createdAt;

    private String username, userphone, useremail;
    private String password, currentPassword, confirmPassword;
    private String residentNo, gender, address;
    private int age;
    private boolean consentInsurance;
    private Patient patient;
}
