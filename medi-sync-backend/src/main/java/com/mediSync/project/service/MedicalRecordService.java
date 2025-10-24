package com.mediSync.project.service;

import com.mediSync.project.mapper.*;
import com.mediSync.project.vo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {

    private final MedicalRecordMapper medicalRecordMapper;
    private final PrescriptionMapper prescriptionMapper;
    private final InventoryItemMapper inventoryItemMapper;
    private final FinanceTransactionMapper financeTransactionMapper;
    private final TestFeeMapper testFeeMapper;
    private static final double INSURANCE_RATE = 0.7;
    private final DoctorMapper doctorMapper;
    private final TestResultMapper testResultMapper;
    private final TestScheduleMapper testScheduleMapper;

    // 1. 진료비 계산 (정상)
    private void calculateCost(MedicalRecord mr) {
        BigDecimal total = BigDecimal.ZERO;

        if (mr.getPrescriptions() != null) {
            for (Prescription p : mr.getPrescriptions()) {
                BigDecimal price = BigDecimal.ZERO;

                switch (p.getType()) {
                    case "DRUG":
                        if (p.getUnitPrice() != null && p.getDosage() != null && p.getDuration() != null) {
                            price = p.getUnitPrice()
                                    .multiply(BigDecimal.valueOf(Double.parseDouble(p.getDosage())))
                                    .multiply(BigDecimal.valueOf(Double.parseDouble(p.getDuration())));
                        }
                        break;

                    case "INJECTION":
                        if (p.getUnitPrice() != null && p.getDosage() != null) {
                            price = p.getUnitPrice()
                                    .multiply(BigDecimal.valueOf(Double.parseDouble(p.getDosage())));
                        }
                        break;

                    case "TEST":
                        if (p.getTestName() != null) {
                            BigDecimal testFee = testFeeMapper.getTestFeeByName(p.getTestName());
                            if (testFee != null) {
                                price = testFee;
                            }
                        }
                        break;
                }

                total = total.add(price);
            }
        }

        Map<String, Object> feeInfo = doctorMapper.getConsultFeeByDoctorId(mr.getDoctorId());
        BigDecimal consultFee = new BigDecimal(feeInfo.get("consultFee").toString());
        BigDecimal insuranceRate = new BigDecimal(feeInfo.get("insuranceRate").toString());

        // ✅ 3) 진료비 추가
        total = total.add(consultFee);

        // ✅ 4) 보험금 / 본인부담금 계산
        BigDecimal insurance = total.multiply(insuranceRate);
        BigDecimal patient = total.subtract(insurance);

        // ✅ 5) 결과 반영
        mr.setTotalCost(total);
        mr.setInsuranceAmount(insurance);
        mr.setPatientPay(patient);
    }

    // 2. 진료 등록 + 재무/재고 로직
    public int insertRecord(MedicalRecord mr) {
        calculateCost(mr);

        int result = medicalRecordMapper.insertRecord(mr);
        if (result <= 0) return 0;

        Long recordId = mr.getRecordId();

        // 처방 삽입 + 연동
        if (mr.getPrescriptions() != null) {
            for (Prescription p : mr.getPrescriptions()) {
                p.setRecordId(recordId);
                prescriptionMapper.insertPrescription(p);

                // (1) 회계 트랜잭션 기록
                FinanceTransaction patientFt = new FinanceTransaction();
                patientFt.setRefType("RECORD");
                patientFt.setRefId(recordId);
                patientFt.setPatientId(mr.getPatientId());
                patientFt.setDoctorId(mr.getDoctorId());
                patientFt.setType("INCOME");
                patientFt.setCategory(p.getType()); //
                patientFt.setAmount(mr.getPatientPay());
                patientFt.setDescription("진료비 (본인 부담금)");
                patientFt.setStatus("COMPLETED");
                financeTransactionMapper.insertFinance(patientFt);

                FinanceTransaction insuracneFt = new FinanceTransaction();
                insuracneFt.setRefType("RECORD");
                insuracneFt.setRefId(recordId);
                insuracneFt.setPatientId(mr.getPatientId());
                insuracneFt.setDoctorId(mr.getDoctorId());
                insuracneFt.setType("CLAIM");
                insuracneFt.setCategory("INSURANCE_CLAIM");
                insuracneFt.setAmount(mr.getInsuranceAmount());
                insuracneFt.setDescription("보험금 청구 예정");
                insuracneFt.setStatus("PENDING");
                financeTransactionMapper.insertFinance(insuracneFt);

                // (2) 약/주사 → 재고 차감
                if ("DRUG".equalsIgnoreCase(p.getType()) || "INJECTION".equalsIgnoreCase(p.getType())) {
                    double usedQty = 0;
                    try {
                        String numeric = p.getDosage().replaceAll("[^0-9.]", "");
                        usedQty = Double.parseDouble(numeric);
                    } catch (Exception e) {
                        usedQty = 1; // fallback
                    }

                    if (usedQty > 0) {
                        String itemName = (p.getDrugName() != null && !p.getDrugName().isEmpty())
                                ? p.getDrugName()
                                : p.getInjectionName();

                        inventoryItemMapper.decreaseQuantityByInven(itemName, usedQty);
                    }
                }
                // 예약 가능여부 체크
                if (p.getType().equals("TEST")) {
                    TestSchedule schedule = testScheduleMapper.findByCodeAndDate(
                            p.getTestCode(),
                            p.getTestDate().toString(),
                            p.getTestTime()
                    );

                }
                    TestResult tr = new TestResult();
                    tr.setRecordId(recordId);
                    tr.setPatientId(mr.getPatientId());
                    tr.setDoctorId(mr.getDoctorId());
                    tr.setTestCode(p.getTestCode());
                    tr.setTestName(p.getTestName());
                    tr.setTestArea(p.getTestArea());
                    tr.setTestDate(p.getTestDate());
                    testResultMapper.insertTestResult(tr);

                }
            }


        return result;
    }

    // 3. 조회 로직
    public List<MedicalRecord> selectRecordAll() {
        return medicalRecordMapper.selectRecordAll();
    }

    public List<MedicalRecord> selectRecordAllByPatientId(Long patientId) {
        return medicalRecordMapper.selectRecordAllByPatientId(patientId);
    }
}
