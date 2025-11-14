package com.mediSync.project.patient.vo;

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
    private Long patientId, userId;
    private String name;
    private String residentNo;
    private String phone;
    private String address;
    private String email;
    private String insurerCode;
    private String status;
    private boolean consentInsurance;
    private String gender;
    private int age;
    private String admissionStatus;
    private String roomNo;
    private LocalDateTime admissionDate;
    private LocalDateTime dischargeDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String room_no;
    private String wardName;
    private String roomStatus;
    private String nurseName;
    private String doctorName;
    private String diagnosis;
}
