package com.mediSync.project.insurance.service;

import com.mediSync.project.insurance.mapper.ClaimMapper;
import com.mediSync.project.insurance.vo.ClaimRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ClaimAutoApproveScheduler {
    private final ClaimMapper claimMapper;

    @Transactional
    @Scheduled(cron = "0 * * * * *")
    public void autoApproveClaims() {
        List<ClaimRequest> pendingClaims = claimMapper.findPendingClaims();
        if  (pendingClaims.isEmpty()) {
            log.info("[AutoApporve] 승인 대기 청구 없음");
            return;
        }
        for (ClaimRequest claim : pendingClaims) {
            BigDecimal payout = claim.getClaimAmount();
            claimMapper.updateClaimPaid(claim.getClaimId(), payout);
            log.info("✅ Claim {} 자동 승인 완료 ({}원)", claim.getClaimId(), payout);
        }
    }
}
