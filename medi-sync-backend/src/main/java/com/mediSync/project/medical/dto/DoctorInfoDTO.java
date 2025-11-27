package com.mediSync.project.medical.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Alias("doctorinfodto")
public class DoctorInfoDTO {
    //의사 기본 정보
    private long adminId;
    private String name;
    private String phone;
    private String email;
    private String position;
    private String licenseNo;
    private long deptId;
    private String deptName;
    private String status;
    private LocalDate hiredDate;
    private LocalDateTime createdAt;
    private String profileImgUrl;

    //평점 추가
    private Double avgRating;
    private int ratingCount;

    //스케쥴 리스트
    private List<DoctorScheduleDTO> schedule;
}
