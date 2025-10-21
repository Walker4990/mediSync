package com.mediSync.project.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Alias("patient")
public class Patient {
    private Long patientId;
    private String name, residentNo, phone, address, insurerCode, status;
    private boolean consentInsurance;
    private LocalDateTime createdAt;
    private LocalDateTime  updatedAt;
}
