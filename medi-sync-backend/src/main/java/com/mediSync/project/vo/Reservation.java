package com.mediSync.project.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("reservation")
public class Reservation {
    private Integer reservation_id;
    private Integer patient_id;
    private Integer doctor_id;
    private Date reservation_date;
    private String status;
    private Date created_at;
}
