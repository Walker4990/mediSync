package com.mediSync.project.common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CalendarDTO {
    private Integer patientId;
    private String title;
    private String startDate;
    private String color;
}
