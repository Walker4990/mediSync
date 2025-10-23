package com.mediSync.project.service;

import com.mediSync.project.mapper.InventoryItemMapper;
import com.mediSync.project.mapper.MedicalRecordMapper;
import com.mediSync.project.mapper.PrescriptionMapper;
import com.mediSync.project.vo.MedicalRecord;
import com.mediSync.project.vo.Prescription;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {

    private final MedicalRecordMapper medicalRecordMapper;
    private final PrescriptionMapper prescriptionMapper;
    private final InventoryItemMapper inventoryItemMapper;

    public int insertRecord(MedicalRecord mr) {
        int result = medicalRecordMapper.insertRecord(mr);
        if (result <= 0) return 0;

        Long recordId = mr.getRecordId();

        if (mr.getPrescriptions() != null) {
            for (Prescription p : mr.getPrescriptions()) {
                p.setRecordId(recordId);
                prescriptionMapper.insertPrescription(p);

                // ✅ 약/주사 처방 시 재고 차감
                if ("DRUG".equalsIgnoreCase(p.getType()) || "INJECTION".equalsIgnoreCase(p.getType())) {
                    double usedQty = 0;

                    try {
                        // 예: "10", "0.5", "5ml" → 숫자만 추출
                        String numeric = p.getDosage().replaceAll("[^0-9.]", "");
                        usedQty = Double.parseDouble(numeric);
                    } catch (Exception e) {
                        usedQty = 1; // fallback
                    }

                    if (usedQty > 0) {
                        String itemName = p.getDrugName() != null && !p.getDrugName().isEmpty()
                                ? p.getDrugName()
                                : p.getInjectionName();
                        inventoryItemMapper.decreaseQuantityByItem(itemName, usedQty);
                    }
                }
            }
        }

        return result;
    }
    public List<MedicalRecord> selectRecordAll(){
        return medicalRecordMapper.selectRecordAll();
    }
    public List<MedicalRecord> selectRecordAllByPatientId(Long patientId){
        return medicalRecordMapper.selectRecordAllByPatientId(patientId);
    }
}
