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
@Alias("drug")
public class Drug {

    private String drugCode;
    private String durgName;
    private BigDecimal unitPrice;
    private int stock;
    private LocalDateTime expirationDate;
    private String supplier;
    private Long inventoryId;
    private LocalDateTime createdAt;

}
