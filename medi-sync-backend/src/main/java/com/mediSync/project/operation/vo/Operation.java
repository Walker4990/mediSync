package com.mediSync.project.operation.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Alias("operation")
public class Operation {
    private Long operationId;
    private Long patientId; // 환자
    private Long doctorId; // 집도의
    private Long staffId;  // 의료진
    private String operationName; // 수술명(위 절제술 등)
    private LocalDate scheduledDate; //수술 예정일
    private String status; // 진행상태
    private String roomNo; // 수술방 번호
    private BigDecimal cost; // 비용
    private LocalDateTime createdAt; // 등록일
    private Long recordId; // 진료 기록
    private String resultNote; // 결과지
    private String anesthesiaType; // 마취 유형
    private LocalDateTime updatedAt;
    private Long roomId; // 수술방
    private String diagnosis; // 진단명
    private LocalTime scheduledTime; // 수술 예정 시간

    private String patientName;
    private String doctorName;
    private String roomName;
}
