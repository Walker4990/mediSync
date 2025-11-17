package com.mediSync.project.medical.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Alias("doctordto")
public class DoctorDTO {
    private long adminId;
    private String name;
    private String phone;
    private String email;
    private String profileImgUrl;
    private String position;
    private String deptName;
    private String description;
    private BigDecimal consultFee;
    private BigDecimal  insuranceRate;
    private LocalDate hiredDate;
}
