package com.mediSync.project.operation.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("operationLog")
public class OperationLog {
    private Long logId;
    private Long operationId;
    private String userName;
    private String action;
    private LocalDateTime createdAt;
}
