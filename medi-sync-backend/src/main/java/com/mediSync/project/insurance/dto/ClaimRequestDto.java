package com.mediSync.project.insurance.dto;

import lombok.Data;
import org.apache.ibatis.type.Alias;

import java.math.BigDecimal;
import java.util.List;

@Data
@Alias("requestDto")
public class ClaimRequestDto {
    private Long claimId;
    private Long recordId;
    private String insurerCode;
    private BigDecimal claimAmount;
    private List<ClaimItemDto> claimItems;
}
