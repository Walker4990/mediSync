package com.mediSync.project.patient.mapper;

import com.mediSync.project.medical.vo.MedicalRecord;
import com.mediSync.project.patient.vo.Patient;
import com.mediSync.project.medical.vo.Prescription;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface PatientMapper {
    int insertPatient(Patient patient);
    int updatePatient(Patient patient);
    Long findPatientIdByUserId(Long userId);
    List<Patient> allPatient(@Param("offset") int offset, @Param("size") int size, @Param("keyword") String keyword);
    List<MedicalRecord> getPatientRecords(Long patientId, @Param("offset") int offset, @Param("size") int size);
    List<Prescription> getPatientPrescriptions(Long patientId, @Param("offset") int offset, @Param("size") int size);
    Patient getPatientDetail(Long patientId);
    List<Map<String, Object>> selectInpatient();
    List<Prescription> findByPatientId(Long patientId);
    void updatePatientAdmissionStatus(Long patientId, String admissionStatus);
    void updatePatientRoom(Long patientId, Long roomId);
    int countAll(Long patientId);
    int countAllRecord(Long patientId);
    int countPatient(String keyword);
    List<Patient> searchPatient(@Param("keyword") String keyword);
}
