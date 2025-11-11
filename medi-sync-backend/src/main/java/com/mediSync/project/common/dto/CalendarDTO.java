package com.mediSync.project.common.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Alias("calendar")
public class CalendarDTO {
    private String title;
    //reservationId, scheduleId,operationId 등
    private long id;
    private long scheduleId;
    private long adminId;
    private long patientId;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "Asia/Seoul")
    private Date startDate;
    private String color;
    private String textColor;
    private String type;
    private String patientName;
    private String doctorName;
}
