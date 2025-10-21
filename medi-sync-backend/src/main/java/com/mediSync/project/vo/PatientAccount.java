package com.mediSync.project.vo;

import lombok.Data;

@Data
public class PatientAccount {
    private Long accountId;
    private Long patientId;
    private String userId;
    private String password;
}
