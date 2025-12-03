package com.mediSync.project.drug.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Alias("drugpurchase")
public class DrugPurchase {
    private int purchaseId;
    private String drugCode;
    private int quantity;
    private int purchasePrice;
    private String lotNo;
    private LocalDate expirationDate;
    private String location;
    private LocalDateTime createdAt;
    private String memo;
}
