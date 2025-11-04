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
    private String name, phone, loginId, password, role;
    private LocalDateTime createdAt;

    private String username, userphone, email;
    private Patient patient;
}
