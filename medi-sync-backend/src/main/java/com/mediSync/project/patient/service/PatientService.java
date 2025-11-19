package com.mediSync.project.patient.service;

import com.mediSync.project.notification.mapper.NotificationMapper;
import com.mediSync.project.patient.dto.PatientDTO;
import com.mediSync.project.patient.mapper.PatientMapper;
import com.mediSync.project.medical.vo.MedicalRecord;
import com.mediSync.project.patient.vo.Patient;
import com.mediSync.project.patient.vo.PatientAccount;
import com.mediSync.project.medical.vo.Prescription;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientService {
    private final PatientMapper patientMapper;
    private final NotificationMapper notificationMapper;

    @Transactional
    public int register(Patient patient) {
        int regiResult = patientMapper.insertPatient(patient);
        //알림설정 테이블에 기본 정보 등록
        notificationMapper.insertNotificationSetting(patient.getPatientId());
        return regiResult;
    }
    public int updatePatient(Patient patient){
        return patientMapper.updatePatient(patient);
    }
    public List<Patient> allPatients(){
        return patientMapper.allPatient();
    }
    public List<MedicalRecord> getPatientRecords(Long patientId) {
        return patientMapper.getPatientRecords(patientId);
    }
    public List<Prescription> getPatientPrescriptions(Long patientId) {
        return patientMapper.getPatientPrescriptions(patientId);
    }
    public Patient getPatientDetail(Long patientId) {
        return patientMapper.getPatientDetail(patientId);
    }

    public List<Patient> selectInpatient() {
        return patientMapper.selectInpatient();
    }

    public List<Prescription> findByPatientId(Long patientId) {
        return  patientMapper.findByPatientId(patientId);
    }
}




