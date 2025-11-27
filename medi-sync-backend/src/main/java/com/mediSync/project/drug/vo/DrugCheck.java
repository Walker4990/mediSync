package com.mediSync.project.drug.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Alias("drugcheck")
public class DrugCheck {
    private long checkId;
    private String drugCode;
    private LocalDate date;
    private String result;
    private String memo;
    private String isChecked;
    private String checkedBy;
}
