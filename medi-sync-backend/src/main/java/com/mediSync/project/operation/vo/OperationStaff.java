package com.mediSync.project.operation.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Alias("operationStaff")
public class OperationStaff {
    private Long staffId;
    private Long operationId;
    private String name;
    private String position;
    private LocalDateTime createdAt;
    private Long medicalStaffId;
}
