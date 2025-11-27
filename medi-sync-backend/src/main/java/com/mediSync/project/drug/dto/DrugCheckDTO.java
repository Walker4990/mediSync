package com.mediSync.project.drug.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Alias("drugcheckdto")
public class DrugCheckDTO {
    //조회용
    private long detailId;
    private long checkId;
    //check
    private LocalDate date;

    private String checkedBy;
    private String isChecked;


    //drug
    private String drugName;
    private String unit;
    private BigDecimal unitPrice;
    private int totalQuantity;
    private LocalDate expirationDate;
    private String supplier; //제약사
    private Long itemId;//개수 상세 기록
    private String insuranceCode;

    //검수 여부

    //inventoryItem
    private String location;
    private int minStock;
    private String status;
    private int quantity;
    private String note;

    //등록용
    private String drugCode;
    private List<Detail> inspections;

    @Data
    public static class Detail{
        //drugCheckDetail
        private long detailId;
        private String status;
        private int quantity;
        private String note;
    }


}
