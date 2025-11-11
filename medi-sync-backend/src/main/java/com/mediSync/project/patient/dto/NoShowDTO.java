package com.mediSync.project.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Alias("noshowdto")
public class NoShowDTO {
    private long noshowId;
    private String name;
    private String email;
    private String date;
    private String time;
    private String doctorName;
    private String type;

}
