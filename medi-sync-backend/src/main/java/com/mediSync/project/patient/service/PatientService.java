package com.mediSync.project.patient.service;

import com.mediSync.project.insurance.mapper.ClaimMapper;
import com.mediSync.project.medical.mapper.MedicalRecordMapper;
import com.mediSync.project.notification.mapper.NotificationMapper;
import com.mediSync.project.patient.dto.PatientDTO;
import com.mediSync.project.patient.mapper.PatientMapper;
import com.mediSync.project.medical.vo.MedicalRecord;
import com.mediSync.project.patient.mapper.ReservationMapper;
import com.mediSync.project.patient.vo.Patient;
import com.mediSync.project.patient.vo.PatientAccount;
import com.mediSync.project.medical.vo.Prescription;
import com.mediSync.project.test.mapper.TestReservationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PatientService {
    private final PatientMapper patientMapper;
    private final NotificationMapper notificationMapper;
    private final MedicalRecordMapper medicalRecordMapper;
    private final ReservationMapper reservationMapper;
    private final TestReservationMapper testReservationMapper;
    private final ClaimMapper claimMapper;

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

    public Long findPatientIdByUserId(Long userId) {
        return patientMapper.findPatientIdByUserId(userId);
    }

    public List<Patient> searchPatient(String keyword){
        return patientMapper.searchPatient(keyword);
    }

    public Map<String, Object> allPatients(int page, int size, String keyword) {
        int offset = (page - 1) * size;

        String searchKeyword = (keyword == null || keyword.trim().isEmpty()) ? null : "%" + keyword + "%";
        List<Patient> items = patientMapper.allPatient(offset, size, searchKeyword);
        int totalCount = patientMapper.countPatient(searchKeyword);
        int totalPages = (int) Math.ceil((double)totalCount / size);

        return Map.of(
                "items", items,
                "totalCount", totalCount,
                "totalPages", totalPages
        );
    }

    public Map<String, Object> getPatientRecords(Long patientId, int page, int size) {
    int offset = (page - 1) * size;
    List<MedicalRecord> items = patientMapper.getPatientRecords(patientId, offset, size);
    int totalCount = patientMapper.countAllRecord(patientId);
    int totalPages = (int) Math.ceil((double)totalCount / size);
    return Map.of(
            "items", items,
            "totalPages", totalPages,
            "totalCount", totalCount
    );
    }
    public Map<String, Object> getPatientPrescriptions(Long patientId, int page, int size) {

        int offset = (page - 1) * size;
        List<Prescription> items = patientMapper.getPatientPrescriptions(patientId, offset, size);
        int totalCount = patientMapper.countAll(patientId);
        int totalPages = (int) Math.ceil((double)totalCount / size);

        return Map.of(
                "items", items,
                "totalPages", totalPages,
                "totalCount", totalCount
        );
    }
    public Patient getPatientDetail(Long patientId) {
        return patientMapper.getPatientDetail(patientId);
    }

    public List<Map<String, Object>> selectInpatient() {
        return patientMapper.selectInpatient();
    }

    public List<Prescription> findByPatientId(Long patientId) {
        return  patientMapper.findByPatientId(patientId);
    }

    public Map<String, Object> patientDashBoard(Long patientId) {
        Map<String, Object> map = new HashMap<>();
        map.put("todayReservation", reservationMapper.countTodayReservations(patientId));
        map.put("todayTests", testReservationMapper.countTodayTests(patientId));
        map.put("claimStatus", claimMapper.latestClamStatus(patientId));

        return map;
    }
}




