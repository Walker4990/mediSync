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
    private Integer reservationId;
    private Integer patientId;
    private Integer doctorId;
    private Date  reservationDate;
    private String status;
    private Date createdAt;
}
