package com.mediSync.project.room.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("room")
public class Room {
    private Long roomId;
    private String roomNo;
    private String wardName;
    private int capacity;
    private int currentCount;
    private String nurseInCharge;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String department;
    private BigDecimal dailyCost;
    private String roomType;
}
