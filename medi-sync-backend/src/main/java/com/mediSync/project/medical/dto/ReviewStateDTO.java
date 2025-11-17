package com.mediSync.project.medical.dto;

import lombok.Data;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@Data
@Alias("reviewstatedto")
public class ReviewStateDTO {
    //별점 통계
    private long adminId;
    private int total; // 총 후기 개수
    private double avgRating;// 평균 별점
    private int rating5Count; //5점 개수
    private int rating4Count; //4점 개수
    private int rating3Count; //3점 개수
    private int rating2Count; //2점 개수
    private int rating1Count; //1점 개수



}
