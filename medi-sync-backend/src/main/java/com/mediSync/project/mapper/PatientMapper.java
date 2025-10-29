package com.mediSync.project.mapper;

import com.mediSync.project.vo.MedicalRecord;
import com.mediSync.project.vo.Patient;
import com.mediSync.project.vo.PatientAccount;
import com.mediSync.project.vo.Prescription;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PatientMapper {
    int insertPatient(Patient patient);
    int insertPatientAccount(PatientAccount account);
    List<Patient> allPatient();
    List<MedicalRecord> getPatientRecords(Long patientId);
    List<Prescription> getPatientPrescriptions(Long patientId);
    Patient getPatientDetail(Long patientId);
}
