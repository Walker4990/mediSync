package com.mediSync.project.patient.dto;

import lombok.Data;

@Data
public class PatientDTO {
    private String name;
    private String residentNo;
    private String phone;
    private String address;
    private boolean consentInsurance;

    private String userId;     // 아이디
    private String password;   // 비밀번호

}
