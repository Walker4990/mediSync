package com.mediSync.project.drug.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Alias("druglog")
public class DrugLog {
    private long logId;
    private String drugCode;
    private String type;
    private int quantity;
    private int beforeStock;
    private int afterStock;
    private String memo;
    private LocalDateTime createdAt;
    private String createdBy;
}
