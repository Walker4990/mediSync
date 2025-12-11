package com.mediSync.project.drug.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Alias("drugpurchasedto")
public class DrugPurchaseDTO {
    private long purchaseId;
    private String drugCode;
    private String drugName;
    private BigDecimal unitPrice;
    private int quantity;
    private LocalDate expirationDate;
    private String supplier;
    private Long inventoryId;
    private LocalDateTime createdAt;
    private String insuranceCode;
    //private String insurerCode;
    private String insurerName;
    private String unit;

    private String location;
    private LocalDateTime updatedAt;
}
