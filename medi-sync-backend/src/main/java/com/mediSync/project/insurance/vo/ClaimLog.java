package com.mediSync.project.insurance.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimLog {
    private Long logId;
    private Long claimId;
    private String status;
    private String message;
    private LocalDateTime loggedAt;
}
