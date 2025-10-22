package com.mediSync.project.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Alias("doctor")
public class Doctor {
    private int doctorId;
    private String doctorName, department, phone, licenseNo;
    private LocalDateTime createdAt;

}
