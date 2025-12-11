package com.mediSync.project.medical.service;

import com.mediSync.project.drug.mapper.DrugCheckMapper;
import com.mediSync.project.drug.mapper.DrugInOutMapper;
import com.mediSync.project.drug.mapper.DrugMapper;
import com.mediSync.project.drug.mapper.InventoryItemMapper;
import com.mediSync.project.drug.vo.Drug;
import com.mediSync.project.drug.vo.DrugLog;
import com.mediSync.project.drug.vo.DrugPurchase;
import com.mediSync.project.finance.mapper.FinanceTransactionMapper;
import com.mediSync.project.finance.vo.FinanceTransaction;
import com.mediSync.project.medical.dto.MedicalRecordDTO;
import com.mediSync.project.medical.mapper.DoctorMapper;
import com.mediSync.project.medical.mapper.MedicalRecordMapper;
import com.mediSync.project.medical.mapper.PrescriptionMapper;
import com.mediSync.project.medical.vo.MedicalRecord;
import com.mediSync.project.medical.vo.Prescription;
import com.mediSync.project.patient.mapper.ReservationMapper;
import com.mediSync.project.test.mapper.TestFeeMapper;
import com.mediSync.project.test.mapper.TestReservationMapper;
import com.mediSync.project.test.mapper.TestResultMapper;
import com.mediSync.project.test.mapper.TestScheduleMapper;
import com.mediSync.project.test.vo.TestReservation;
import com.mediSync.project.test.vo.TestSchedule;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
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
    private final DrugMapper drugMapper;
    private final DrugInOutMapper drugInOutMapper;
    private final DrugCheckMapper drugCheckMapper;

    // 1. 진료비 계산 (정상)
    public void calculateCost(MedicalRecord mr) {
        BigDecimal total = BigDecimal.ZERO;

        if (mr.getPrescriptions() != null) {
            for (Prescription p : mr.getPrescriptions()) {
                BigDecimal price = BigDecimal.ZERO;

                String type = p.getType();
                BigDecimal unitPrice = p.getUnitPrice();


                switch (type) {
                    case "DRUG": {
                        double rawDosage = p.getDosage();
                        int dosage = (int) Math.round(rawDosage);
                        int duration = (p.getDuration() != 0) ? p.getDuration() : 1;

                        int totalQty = dosage * duration;

                        if (unitPrice != null) {
                            price = unitPrice.multiply(BigDecimal.valueOf(totalQty));
                        }
                        break;
                    }
                    case "INJECTION": {
                        double dosage = p.getDosage();
                        int duration = (p.getDuration() !=0 ? p.getDuration() : 1);
                        double totalQty = dosage * duration;

                        if (unitPrice != null) {
                            price = unitPrice
                                    .multiply(BigDecimal.valueOf(totalQty));
                        }
                        break;
                    }
                    case "TEST": {
                        if (p.getTestName() != null) {
                            BigDecimal testFee = testFeeMapper.getTestFeeByName(p.getTestName());
                            if (testFee != null) {
                                price = testFee;
                            }
                        }
                        break;
                    }
                }

                total = total.add(price);
            }
        }

        Map<String, Object> feeInfo = doctorMapper.getConsultFeeByDoctorId(mr.getAdminId());
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



                FinanceTransaction insuranceFt = new FinanceTransaction();
                insuranceFt.setRefType("RECORD");
                insuranceFt.setRefId(recordId);
                insuranceFt.setPatientId(mr.getPatientId());
                insuranceFt.setAdminId(mr.getAdminId());
                insuranceFt.setType("CLAIM");
                insuranceFt.setCategory("INSURANCE_CLAIM");
                insuranceFt.setAmount(mr.getInsuranceAmount());
                insuranceFt.setDescription("보험금 청구 예정");
                insuranceFt.setStatus("PENDING");
                financeTransactionMapper.insertFinance(insuranceFt);

                // (2) 약 → 재고 차감
                if ("DRUG".equalsIgnoreCase(p.getType())|| "INJECTION".equalsIgnoreCase(p.getType())) {
                    int usedQty =1;
                            if("DRUG".equalsIgnoreCase(p.getType())){
                                 usedQty= (int) Math.round(p.getDosage()) * p.getDuration();
                            }else if ("INJECTION".equalsIgnoreCase(p.getType())){
                                usedQty = (p.getDuration() != 0 ? p.getDuration() : 1);
                            }

                    //약 재고 차감
                    System.out.println("사용한 악품 개수 : "+ usedQty);
                    if (usedQty > 0) {
                        String itemName = (p.getDrugName() != null && !p.getDrugName().isEmpty())
                                ? p.getDrugName()
                                : p.getInjectionName();
                        //기존 약품 정보
                        Drug origin = drugMapper.selectDrugByDrugCode(p.getDrugCode());

                        if (origin == null) {
                            throw new RuntimeException("해당 약품을 찾을 수 없습니다: " + p.getDrugCode());
                        }


                        System.out.println("기존 개수 : " + origin.getQuantity());
                        drugMapper.decreaseQuantityByInven(itemName, usedQty);
                        //업데이트된 drug 정보
                        Drug updated = drugMapper.selectDrugByDrugCode(p.getDrugCode());
                        System.out.println("바뀐 개수 : " + updated.getQuantity());

                        //drug_purchase 테이블 재고 반영
                        List<DrugPurchase> pur = drugMapper.getDrugPurchaseOrderByDate(p.getDrugCode());
                        int remain = usedQty;
                        
                        for (DrugPurchase dp : pur){
                            System.out.println("현재 남은 개수 : "+ remain);
                            if(remain<=0){
                                break;
                            }
                            int lotQty = dp.getQuantity();
                            System.out.println("현재 재고 개수 : "+ lotQty);
                            if(lotQty > remain){
                                //일부 개수 줄이기
                                Map<String, Object> params = new HashMap<>();
                                params.put("purchaseId",dp.getPurchaseId());
                                params.put("remain", lotQty - remain);
                                drugMapper.updateLotQuantity(params);
                                remain = 0;
                            }
                            else{
                                //수량 깎고 삭제
                                drugMapper.deleteLot(dp.getPurchaseId());
                                remain -= lotQty;
                                System.out.println("테이블 삭제");
                            }
                        }

                        //로그 남기기
                        DrugLog log = new DrugLog();
                        log.setDrugCode(p.getDrugCode());
                        log.setQuantity((int) Math.round(p.getDosage()));
                        log.setMemo("약 처방");
                        log.setType("OUT");
                        log.setBeforeStock(origin.getQuantity());
                        log.setAfterStock(updated.getQuantity());

                        drugCheckMapper.insertDrugLog(log);
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
                    reservation.setAdminId(mr.getAdminId());
                    reservation.setStatus("RESERVED");
                    reservation.setReservedAt(p.getTestDate().atTime(9, 0));
                    testReservationMapper.insertTestReservation(reservation);

                    // 예약 수 증가
                    testScheduleMapper.increaseReservedCount(schedule.getScheduleId());

                }

            }
            FinanceTransaction totalIncome = new FinanceTransaction();
            totalIncome.setRefType("RECORD");
            totalIncome.setRefId(recordId);
            totalIncome.setPatientId(mr.getPatientId());
            totalIncome.setAdminId(mr.getAdminId());
            totalIncome.setType("INCOME");
            totalIncome.setCategory("TOTAL_COST");
            totalIncome.setAmount(mr.getPatientPay());
            totalIncome.setDescription("진료비 총액 (본인 부담금)");
            totalIncome.setStatus("PENDING");
            financeTransactionMapper.insertFinance(totalIncome);
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
    //페이징 포함 진료기록 조회
    public List<MedicalRecord> selectRecordAllByPatientIdWithPage(Long patientId, int page, int size) {
        int offset = page * size;
        return medicalRecordMapper.selectRecordAllByPatientIdWithPage(patientId,offset, size);
    }


    public List<MedicalRecord> selectReservedRecords(LocalDate date) {
        return medicalRecordMapper.selectReservedRecords(date);
    }
    
    //진료기록 상세 조회
    public MedicalRecord selectRecordDetailByRecordId(long recordId){
        return medicalRecordMapper.selectRecordDetailByRecordId(recordId);
    }
}
