package com.mediSync.project.medical.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("doctor")
public class Doctor {
    private Long doctorId;
    private String doctorName;
    private String licenseNo;
    private String phone;
    private LocalDateTime createdAt;

    private Long deptId;
    private String deptName;
}
