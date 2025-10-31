package com.mediSync.project.test.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("testSchedule")
public class TestSchedule {

    private Long scheduleId;
    private String testCode;
    private String testName;
    private LocalDate testDate;
    private String testTime;
    private int capacity;
    private int reserved;
    private String status;
}
