package com.mediSync.project.operation.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("cost")
public class OperationCost {
    private String operationName;
    private int baseCost;
}
