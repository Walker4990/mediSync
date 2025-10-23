package com.mediSync.project.service;

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
    public int insertRecord(MedicalRecord mr) {
        int result = medicalRecordMapper.insertRecord(mr);
        if (result <= 0) return 0;

        Long recordId = mr.getRecordId();

        if (mr.getPrescriptions() != null) {
            for (Prescription p : mr.getPrescriptions()) {
                p.setRecordId(recordId);
                prescriptionMapper.insertPrescription(p);
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
