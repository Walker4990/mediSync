package com.mediSync.project.finance.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Alias("finance")
public class FinanceTransaction {

    private Long txId;
    private String refType;
    private Long refId;
    private Long patientId;
    private Long doctorId;
    private String type;
    private String category;
    private BigDecimal amount;
    private String description;
    private String status;
    private LocalDate createdAt;
    private LocalDate updatedAt;

}
