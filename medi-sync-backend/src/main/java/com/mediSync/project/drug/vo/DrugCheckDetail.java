package com.mediSync.project.drug.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Alias("drugcheckdetail")
public class DrugCheckDetail {
    private long detailId;
    private long checkId;
    private String status;// 약품 상태(정상, 이상, 폐기 요망)
    private int quantity; // 개수
    private String note;// 품질 작성

}
