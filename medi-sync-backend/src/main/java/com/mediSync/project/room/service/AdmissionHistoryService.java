package com.mediSync.project.room.service;

import com.mediSync.project.room.mapper.AdmissionHistoryMapper;
import com.mediSync.project.room.vo.AdmissionHistory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdmissionHistoryService {

    private AdmissionHistoryMapper admissionHistoryMapper;

    public List<AdmissionHistory> selectHistoryByPatient(Long patientId) {
        return admissionHistoryMapper.selectHistoryByPatient(patientId);
    }
    public List<AdmissionHistory> selectAllHistory() {
        return admissionHistoryMapper.selectAllHistory();
    }
    public int insertAdmissionHistory(Long patientId, Long roomId, String reason) {
        return admissionHistoryMapper.insertAdmissionHistory(patientId, roomId, reason);
    }
    public int updateDischargeHistory(Long patientId) {
        return admissionHistoryMapper.updateDischargeHistory(patientId);
    }
}
