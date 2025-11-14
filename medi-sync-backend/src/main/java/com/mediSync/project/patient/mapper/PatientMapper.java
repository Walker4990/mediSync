package com.mediSync.project.patient.mapper;

import com.mediSync.project.medical.vo.MedicalRecord;
import com.mediSync.project.patient.vo.Patient;
import com.mediSync.project.patient.vo.PatientAccount;
import com.mediSync.project.medical.vo.Prescription;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PatientMapper {
    int insertPatient(Patient patient);
    int updatePatient(Patient patient);
    List<Patient> allPatient();
    List<MedicalRecord> getPatientRecords(Long patientId);
    List<Prescription> getPatientPrescriptions(Long patientId);
    Patient getPatientDetail(Long patientId);
    List<Patient> selectInpatient();
    List<Prescription> findByPatientId(Long patientId);
    int updatePatientAdmissionStatus(Long patientId, String admissionStatus);


}
