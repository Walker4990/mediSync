package com.mediSync.project.medical.dto;

import lombok.Data;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;

@Data
@Alias("reviewdto2")
public class ReviewDTO {
    private long reviewId;
    private long patientId;
    private long adminId;
    private String name;
    private int rating;
    private String memo;
    private String title;
    private LocalDateTime createdAt;
    private String type;
    private long typeId;
}
