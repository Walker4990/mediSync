package com.mediSync.project.insurance.service;

import com.mediSync.project.insurance.mapper.ClaimMapper;
import com.mediSync.project.insurance.mapper.PatientInsuranceMapper;
import lombok.RequiredArgsConstructor;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PatientInsuranceService {
    private final PatientInsuranceMapper patientInsuranceMapper;
    private final ClaimMapper claimMapper;
    private final InsurerSyncService insurerSyncService;

    public List<Map<String, Object>> selectByPatientIdOrderByCoverageDesc(@Param("patientId") Long patientId) {
        return patientInsuranceMapper.selectByPatientIdOrderByCoverageDesc(patientId);
    }
    public Map<String, Object> syncWithKftc(Long patientId) {
        int synced = insurerSyncService.syncForPatient(patientId);
        return Map.of("success", true, "syncedCount", synced);
    }
    /** 청구 이력 조회 */
    public List<Map<String, Object>> getClaimHistory(Long patientId) {
        return patientInsuranceMapper.selectClaimHistoryByPatient(patientId);
    }
}
