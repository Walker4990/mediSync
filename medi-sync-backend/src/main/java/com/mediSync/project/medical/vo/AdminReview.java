package com.mediSync.project.medical.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDateTime;
import java.util.Date;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Alias("review")
public class AdminReview {
    private long reviewId;
    private long adminId;
    private  long patientId;
    private long typeId;
    private String type;
    private int rating;
    private boolean isPublic;
    private String memo;
    private LocalDateTime createdAt;
}
