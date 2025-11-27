package com.mediSync.project.medical.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Alias("dsdto")
public class DoctorScheduleDTO {
    private long doctorScheduleId;
    private long adminId;
    private String week;
    private String startTime;
    private String endTime;
    private Integer isWorking;

}
