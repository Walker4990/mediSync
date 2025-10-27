package com.mediSync.project.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("reservation")
public class Reservation {
    private Integer reservation_id;

    @JsonProperty("patient_id")
    private Integer patient_id;
    @JsonProperty("doctor_id")
    private Integer doctor_id;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    @JsonProperty("reservation_date")
    private LocalDateTime reservation_date;

    @JsonProperty("status")
    private String status;
    @JsonProperty("created_at")
    private Date created_at;
}
