package com.mediSync.project.room.mapper;

import com.mediSync.project.room.vo.AdmissionHistory;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface AdmissionHistoryMapper {
    int insertAdmissionHistory(Long patientId, Long roomId, String reason);
    int updateDischargeHistory(Long patientId);

    List<AdmissionHistory> selectAllHistory();
    List<AdmissionHistory> selectHistoryByPatient(Long patientId);
}
