package com.mediSync.project.medical.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("reviewdto")
public class AdminReviewDTO {
    private long typeId;//예약 키
    private long patientId;//환자 키
    private long adminId;//의사 키
    private String type;//예약 종류 ("RESERVATION", "TEST", "OPERATION")
    private String name; //진단명
    private LocalDateTime date; //예약 날짜

}
