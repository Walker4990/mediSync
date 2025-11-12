package com.mediSync.project.insurance.dto;

import lombok.Data;
import org.apache.ibatis.type.Alias;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Alias("treatment")
public class TreatmentDto {
    private Long recordId;
    private String diagnosis;
    private BigDecimal amount;
    private String department;
    private String date;
    private String time;

    private String status;
    private List<String> claimableItems = new ArrayList<>();
    private List<String> claimedItemHistory = new ArrayList<>();
}
