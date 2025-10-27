package com.mediSync.project.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("inven")
public class InventoryItem {
    private Long itemId;
    private String itemName, unit, supplier, location, drugCode;
    private int quantity, minStock;
    private BigDecimal price;
    private LocalDate expiryDate;
    private LocalDateTime updatedAt;
}
