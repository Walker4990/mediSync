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
    public Map<String, Object> run(Long recordId) {

        BigDecimal total = BigDecimal.ZERO;
        BigDecimal insPay = BigDecimal.ZERO;
        BigDecimal patientPay = BigDecimal.ZERO;
        double rate = 0.0;
        Long claimId = null;
        String resultCode = null;
        BigDecimal paidAmount = BigDecimal.ZERO;
        String message = null;

        try {
            // 1️⃣ 진료기록 조회
            var rec = medicalRecordMapper.findById(recordId);
            Long patientId = ((Number) rec.get("patient_id")).longValue();
            total = toBD(rec.get("total_cost") != null ? rec.get("total_cost") : rec.get("totalCost"));
            System.out.println("🧾 rec map => " + rec);

            // 2️⃣ 환자 보험 목록 조회
            var insList = patientInsuranceMapper.selectByPatientIdOrderByCoverageDesc(patientId);

            String rawInsurerCode = insList.isEmpty()
                    ? null
                    : (insList.get(0).get("insurer_code") == null
                    ? null
                    : String.valueOf(insList.get(0).get("insurer_code")).trim());

            Double rawRate = insList.isEmpty()
                    ? null
                    : toDouble(insList.get(0).get("coverage_rate"));

            String insurerCode;

            if (rawInsurerCode == null || rawInsurerCode.isEmpty() || rawInsurerCode.equalsIgnoreCase("null")) {
                insurerCode = "INS001";
                rate = 80.0;
            } else {
                insurerCode = rawInsurerCode;
                rate = rawRate != null ? rawRate : 0.0;
            }

            // 3️⃣ 금액 계산
            insPay = total.multiply(bd(rate)).divide(bd(100));
            patientPay = total.subtract(insPay);

            // 4️⃣ 진료기록 및 청구금액 반영
            medicalRecordMapper.updateAmounts(recordId, insPay, patientPay);
            billingMapper.upsertByRecordId(recordId, total, insPay, "WAIT");
            System.out.printf("✅ rate=%.2f, insPay=%s, total=%s%n", rate, insPay, total);

            // 5️⃣ 청구 생성
            claimMapper.insertClaim(recordId, insurerCode, insPay, 1);
            var lastClaim = claimMapper.findLastClaimByRecord(recordId);
            claimId = ((Number) lastClaim.get("claim_id")).longValue();

            // 6️⃣ 청구 항목 기본 구성
            List<ClaimItemDto> items = new ArrayList<>();
            items.add(new ClaimItemDto("진찰료", insPay.multiply(BigDecimal.valueOf(0.3))));
            items.add(new ClaimItemDto("검사료", insPay.multiply(BigDecimal.valueOf(0.4))));
            items.add(new ClaimItemDto("약제비", insPay.multiply(BigDecimal.valueOf(0.3))));
            claimMapper.insertClaimItems(claimId, items);
            claimMapper.insertClaimLog(claimId, "SENT", "자동 청구 생성");

            // 7️⃣ 보험사 전송 (mock API)
            Map<String, Object> resp = kftcInsuranceClient.submitClaim(claimId, insurerCode, insPay);
            System.out.println("🧩 [DEBUG] CLAIM RESP: " + resp);

            resultCode = (String) (resp.get("result_code") != null ? resp.get("result_code") : resp.get("resultCode"));
            Object paidObj = resp.get("paid_amount") != null ? resp.get("paid_amount") : resp.get("paidAmount");
            paidAmount = paidObj != null ? new BigDecimal(paidObj.toString()) : BigDecimal.ZERO;
            message = (String) resp.getOrDefault("message", "");

            // 8️⃣ 청구 응답 저장
            int updated = claimMapper.updateClaimResponse(claimId, paidAmount, resultCode, message);
            if (updated == 0) {
                try {
                    claimMapper.insertClaimResponse(claimId, paidAmount, resultCode, message);
                } catch (NoSuchMethodError | AbstractMethodError ex) {
                    System.err.println("⚠️ insertClaimResponse 없음 — update만 수행됨: " + ex.getMessage());
                }
            }

            claimMapper.insertClaimLog(claimId, resultCode, message);

            // 9️⃣ 회계 반영
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
            e.printStackTrace();
            throw new RuntimeException("ClaimOrchestrator.run 실패", e);
        }

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

    public Map<String, Object> selectClaimHistoryByPatient(Long patientId, int page, int size) {
        int offset = (page - 1) * size;
        List<Map<String, Object>> items = claimMapper.selectClaimHistoryByPatient(patientId);
        int totalCount = claimMapper.countAll(patientId);
        int totalPages = (int) Math.ceil((double)totalCount / size);

        return Map.of(
                "items", items,
                "totalCount", totalCount,
                "totalPages", totalPages
        );
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
