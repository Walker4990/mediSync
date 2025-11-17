package com.mediSync.project.insurance.service;

import com.mediSync.project.finance.mapper.FinanceTransactionMapper;
import com.mediSync.project.finance.vo.FinanceTransaction;
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
    private final FinanceTransactionMapper financeTransactionMapper;

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

            FinanceTransaction ft = new FinanceTransaction();
            ft.setRefId(claim.getClaimId());
            ft.setRefType("CLAIM");
            ft.setPatientId(claim.getPatientId());
            ft.setAdminId(null);
            ft.setType("INCOME");
            ft.setCategory("INSURANCE_SETTLEMENT");
            ft.setAmount(payout);
            ft.setDescription("보험사 자동 승인 지급 반영");
            ft.setStatus("COMPLETED");
            financeTransactionMapper.insertFinance(ft);
            log.info("💰 재무 트랜잭션 등록 완료: claimId={} patientId={}", claim.getClaimId(), claim.getPatientId());
        }
    }
}
