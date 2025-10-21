package com.mediSync.project.service;

import com.mediSync.project.dto.PatientDTO;
import com.mediSync.project.mapper.PatientMapper;
import com.mediSync.project.vo.Patient;
import com.mediSync.project.vo.PatientAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientService {
    private final PatientMapper patientMapper;


    @Transactional
    public void register(PatientDTO dto) {
        // 1️⃣ patient 등록
        Patient patient = new Patient();
        patient.setName(dto.getName());
        patient.setResidentNo(dto.getResidentNo());
        patient.setPhone(dto.getPhone());
        patient.setAddress(dto.getAddress());
        patient.setConsentInsurance(dto.isConsentInsurance());
        patientMapper.insertPatient(patient);

        // 2️⃣ account 등록 (암호화 필수)
        PatientAccount account = new PatientAccount();
        account.setPatientId(patient.getPatientId());
        account.setUserId(dto.getUserId());
        account.setPassword(dto.getPassword());
        patientMapper.insertPatientAccount(account);
    }
    public List<Patient> allPatients(){
        return patientMapper.allPatient();
    }
}




