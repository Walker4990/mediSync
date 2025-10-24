package com.mediSync.project.vo;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor(force = true)
@AllArgsConstructor
@Alias("inven")
public class InventoryItem {

    private Long itemId;
    private String itemName;
    private String unit;
    private Long quantity;
    private BigDecimal price;
    private String supplier;
    private LocalDate expiryDate;
    private String location;
    private int minStock;
    private LocalDateTime updatedAt;
    private String drugCode;

}
