package com.mediSync.project.insurance.service;

import com.mediSync.project.finance.mapper.BillingMapper;
import com.mediSync.project.finance.mapper.FinanceTransactionMapper;
import com.mediSync.project.finance.vo.FinanceTransaction;
import com.mediSync.project.insurance.dto.ClaimItemDto;
import com.mediSync.project.insurance.dto.ClaimRequestDto;
import com.mediSync.project.insurance.dto.TreatmentDto;
import com.mediSync.project.insurance.mapper.ClaimMapper;
import com.mediSync.project.insurance.mapper.PatientInsuranceMapper;
import com.mediSync.project.insurance.vo.Insurer;
import com.mediSync.project.medical.mapper.MedicalRecordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ClaimOrchestrator {
    private final MedicalRecordMapper medicalRecordMapper;
    private final PatientInsuranceMapper patientInsuranceMapper;
    private final ClaimMapper claimMapper;
    private final BillingMapper billingMapper;
    private final FinanceTransactionMapper financeTransactionMapper;
    private final KftcInsuranceClient kftcInsuranceClient;

    @Transactional
    public Map<String,Object> run(Long recordId) {

        // <-- 변수들을 try 밖에서 선언 (원본과 동일한 흐름 유지)
        java.math.BigDecimal total = java.math.BigDecimal.ZERO;
        java.math.BigDecimal insPay = java.math.BigDecimal.ZERO;
        java.math.BigDecimal patientPay = java.math.BigDecimal.ZERO;
        double rate = 0.0;
        Long claimId = null;
        String resultCode = null;
        java.math.BigDecimal paidAmount = java.math.BigDecimal.ZERO;
        String message = null;

        try {
            // 1) 진료기록 조회
            var rec = medicalRecordMapper.findById(recordId);
            Long patientId = ((Number) rec.get("patient_id")).longValue();
            total = toBD(rec.get("total_cost") != null ? rec.get("total_cost") : rec.get("totalCost"));
            System.out.println("🧾 rec map => " + rec);
            System.out.println("🧾 total_cost(raw) => " + rec.get("total_cost"));
            System.out.println("🧾 totalCost(camel) => " + rec.get("totalCost"));

            // 2) 환자 보험 목록
            var insList = patientInsuranceMapper.selectByPatientIdOrderByCoverageDesc(patientId);
            rate = insList.isEmpty() ? 0.0 : toDouble(insList.get(0).get("coverage_rate"));
            String insurerCode = insList.isEmpty() ? null : String.valueOf(insList.get(0).get("insurer_code"));

            // 3) 금액 계산
            insPay = total.multiply(bd(rate)).divide(bd(100));
            patientPay = total.subtract(insPay);

            // 4) medical_record & billing 반영
            medicalRecordMapper.updateAmounts(recordId, insPay, patientPay);
            billingMapper.upsertByRecordId(recordId, total, insPay, "WAIT");
            System.out.printf("✅ rate=%.2f, insPay=%s, total=%s%n", rate, insPay, total);

            // 5) 청구 생성
            claimMapper.insertClaim(recordId, insurerCode, insPay, 1);
            var lastClaim = claimMapper.findLastClaimByRecord(recordId);
            claimId = ((Number) lastClaim.get("claim_id")).longValue();

            // ✅ ClaimItemDto 리스트 생성
            List<ClaimItemDto> items = new ArrayList<>();
            items.add(new ClaimItemDto("진찰료", insPay.multiply(BigDecimal.valueOf(0.3))));
            items.add(new ClaimItemDto("검사료", insPay.multiply(BigDecimal.valueOf(0.4))));
            items.add(new ClaimItemDto("약제비", insPay.multiply(BigDecimal.valueOf(0.3))));

// ✅ Mapper 호출 (시그니처에 맞게)
            claimMapper.insertClaimItems(claimId, items);


            // 5.1 -> 초기 로그 남기기 (원본 방식 유지)
            claimMapper.insertClaimLog(claimId, "SENT", "자동 청구 생성");

            // 6) 보험사로 전송 (mock 또는 실제)
            Map<String, Object> resp = kftcInsuranceClient.submitClaim(claimId, insurerCode, insPay);
            System.out.println("🧩 [DEBUG] CLAIM RESP: " + resp);

            // 6.1 응답 키 유연 처리 (camel / snake 둘다 허용)
            resultCode = (String) (resp.get("result_code") != null ? resp.get("result_code") : resp.get("resultCode"));
            Object paidObj = resp.get("paid_amount") != null ? resp.get("paid_amount") : resp.get("paidAmount");
            if (paidObj != null) {
                // 안전하게 BigDecimal 변환
                paidAmount = new java.math.BigDecimal(paidObj.toString());
            } else {
                paidAmount = java.math.BigDecimal.ZERO;
            }
            message = (String) resp.getOrDefault("message", "");

            // 7) 응답 반영 — 먼저 update 시도, 변경된 로우가 없으면 (0) insert 시도 (아래에 mapper 추가 예시 있음)
            int updated = claimMapper.updateClaimResponse(claimId, paidAmount, resultCode, message);
            if (updated == 0) {
                // insertClaimResponse가 Mapper에 정의되어 있어야 함 (아래 참조)
                try {
                    claimMapper.insertClaimResponse(claimId, paidAmount, resultCode, message);
                } catch (NoSuchMethodError | AbstractMethodError ex) {
                    // 만약 Mapper에 insertClaimResponse가 없으면 여기서 잡아서 로그만 남김
                    System.err.println("⚠️ insertClaimResponse 메서드 없음 — update만 수행됨. 에러: " + ex.getMessage());
                }
            }

            // 7.1 로그 남기기
            claimMapper.insertClaimLog(claimId, resultCode, message);

            // 8) 회계 반영 (보험 입금 확정 시)
            if ("SUCCESS".equalsIgnoreCase(resultCode)) {
                FinanceTransaction ft = new FinanceTransaction();
                ft.setType("CLAIM");
                ft.setRefId(claimId);
                ft.setPatientId(patientId);
                ft.setCategory("INCOME");
                ft.setDescription("보험금");
                ft.setAmount(paidAmount);
                ft.setStatus("COMPLETED");

                financeTransactionMapper.insertFinance(ft);
            }

        } catch (Exception e) {
            // 정정: 예외를 완전히 무시하면 원인 파악 불가하니 반드시 로그 남겨라
            e.printStackTrace();
            // 필요하면 다시 던져서 밖에서 롤백/처리하자. 여기서는 재던지기로 변경(원하면 주석 처리)
            throw new RuntimeException("ClaimOrchestrator.run 실패", e);
        }

        // 안전하게 로컬 변수들을 리턴 (선언부가 try 밖에 있으므로 접근 가능)
        return Map.of(
                "recordId", recordId,
                "total", total,
                "coverageRate", rate,
                "insurancePay", insPay,
                "patientPay", patientPay,
                "claimId", claimId,
                "claimResult", resultCode
        );
    }


    private static BigDecimal toBD(Object o){
        return o==null? BigDecimal.ZERO : new BigDecimal(String.valueOf(o));
    }
    private static BigDecimal bd(double v){
        return new BigDecimal(String.valueOf(v));
    }
    private static double toDouble(Object o){
        return o==null ? 0.0 : Double.parseDouble(String.valueOf(o));
    }


    public List<TreatmentDto> getTreatmentList(Long patientId) {
        List<TreatmentDto> list = claimMapper.selectTreatmentList(patientId);
        list.forEach(t -> {
            if (t.getClaimableItems().isEmpty()) {
                t.setClaimableItems(List.of("진찰료", "검사료", "약제비"));
            }
            t.setClaimedItemHistory(new ArrayList<>()); // 필요 시 실제 이력 조회로 교체
        });
        return list;
    }

    public List<Insurer> getInsurerList() {
        return claimMapper.selectInsurerList();
    }
    public List<Map<String, Object>> selectClaimHistoryByPatient(Long patientId) {
        return claimMapper.selectClaimHistoryByPatient(patientId);
    }
    @Transactional
    public void submitClaim(ClaimRequestDto dto) {

        //  1. 진료기록의 total_cost 불러오기
        BigDecimal total = claimMapper.findTotalCostByRecordId(dto.getRecordId());
        if (total == null) total = BigDecimal.ZERO;

        //  2. 보험사 보장율(coverage_rate) 불러오기
        BigDecimal coverage = claimMapper.findCoverageByInsurerCode(dto.getInsurerCode());
        if (coverage == null) coverage = BigDecimal.ZERO;

        //  3. 청구 금액 자동 계산 (total × coverage / 100)
        BigDecimal claimAmount = total.multiply(coverage).divide(new BigDecimal("100"));
        dto.setClaimAmount(claimAmount);

        //  4. 청구 기본 정보 insert
        claimMapper.insertClaimRequest(dto);
        Long claimId = dto.getClaimId();

        //  5. 청구 항목이 있으면 item insert
        if (dto.getClaimItems() != null && !dto.getClaimItems().isEmpty()) {
            claimMapper.insertClaimItems(claimId, dto.getClaimItems());
        }

        //  디버그용 로그
        System.out.printf("✅ Claim Submitted: recordId=%d, insurer=%s, total=%s, coverage=%s, claimAmount=%s%n",
                dto.getRecordId(), dto.getInsurerCode(), total, coverage, claimAmount);
    }
}
