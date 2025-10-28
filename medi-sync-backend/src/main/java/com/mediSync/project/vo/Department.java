package com.mediSync.project.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("dept")
public class Department {
    private Long deptId;
    private String deptName, description;
    private BigDecimal consultFee, insuranceRate;
    private LocalDateTime createdAt;
}
