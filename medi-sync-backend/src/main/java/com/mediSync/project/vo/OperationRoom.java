package com.mediSync.project.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("operationRoom")
public class OperationRoom {
    private Long roomId;
    private String roomName;
    private int capacity;
    private boolean available;
    private LocalDateTime createdAt;
}
