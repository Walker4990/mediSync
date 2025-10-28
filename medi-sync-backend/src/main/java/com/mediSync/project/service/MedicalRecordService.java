package com.mediSync.project.service;

import com.mediSync.project.mapper.*;
import com.mediSync.project.vo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    private final DoctorMapper doctorMapper;
    private final TestResultMapper testResultMapper;
    private final TestScheduleMapper testScheduleMapper;
    private final TestReservationMapper testReservationMapper;
    private final ReservationMapper reservationMapper;

    // 1. 진료비 계산 (정상)
    public void calculateCost(MedicalRecord mr) {
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
    @Transactional
    public int insertRecord(MedicalRecord mr) {
        calculateCost(mr);

        int result = medicalRecordMapper.insertRecord(mr);
        if (result <= 0) return 0;

        Long recordId = mr.getRecordId();

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
                patientFt.setCategory(p.getType());
                patientFt.setAmount(mr.getPatientPay());
                patientFt.setDescription("진료비 (본인 부담금)");
                patientFt.setStatus("COMPLETED");
                financeTransactionMapper.insertFinance(patientFt);

                FinanceTransaction insuranceFt = new FinanceTransaction();
                insuranceFt.setRefType("RECORD");
                insuranceFt.setRefId(recordId);
                insuranceFt.setPatientId(mr.getPatientId());
                insuranceFt.setDoctorId(mr.getDoctorId());
                insuranceFt.setType("CLAIM");
                insuranceFt.setCategory("INSURANCE_CLAIM");
                insuranceFt.setAmount(mr.getInsuranceAmount());
                insuranceFt.setDescription("보험금 청구 예정");
                insuranceFt.setStatus("PENDING");
                financeTransactionMapper.insertFinance(insuranceFt);

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

                // ✅ (3) 검사(TEST) → 스케줄 & 예약 자동 등록
                if ("TEST".equalsIgnoreCase(p.getType())) {

                    // 스케줄 존재 확인
                    TestSchedule schedule = testScheduleMapper.findByCodeAndDate(
                            p.getTestCode(),
                            p.getTestDate().toString(),
                            p.getTestTime()
                    );

                    // 없으면 새로 생성
                    if (schedule == null) {
                        testScheduleMapper.insertSchedule(
                                p.getTestCode(),
                                p.getTestDate().toString(),
                                p.getTestTime()
                        );

                        // 다시 조회해서 schedule_id 가져오기
                        schedule = testScheduleMapper.findByCodeAndDate(
                                p.getTestCode(),
                                p.getTestDate().toString(),
                                p.getTestTime()
                        );
                    }

                    // 예약 등록
                    TestReservation reservation = new TestReservation();
                    reservation.setScheduleId(schedule.getScheduleId());
                    reservation.setPatientId(mr.getPatientId());
                    reservation.setDoctorId(mr.getDoctorId());
                    reservation.setStatus("RESERVED");
                    reservation.setReservedAt(p.getTestDate().atTime(9, 0));
                    testReservationMapper.insertTestReservation(reservation);

                    // 예약 수 증가
                    testScheduleMapper.increaseReservedCount(schedule.getScheduleId());

                }

            }
            reservationMapper.updateStatus(mr.getPatientId(), "DONE");
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
    public List<MedicalRecord> selectReservedRecords(LocalDate date) {
        return medicalRecordMapper.selectReservedRecords(date);
    }
}
