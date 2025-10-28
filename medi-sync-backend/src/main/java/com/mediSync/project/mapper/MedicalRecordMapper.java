package com.mediSync.project.mapper;

import com.mediSync.project.vo.MedicalRecord;
import org.apache.ibatis.annotations.Mapper;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface MedicalRecordMapper {
    // 진료 등록
    int insertRecord(MedicalRecord record);
    // 진료 기록 전체 조회
    List<MedicalRecord> selectRecordAll();
    // 환자별 진료 기록 조회
    List<MedicalRecord> selectRecordAllByPatientId(Long patientId);
    // 환자 처방전 조회
    MedicalRecord selectRecordById(Long recordId);
    List<MedicalRecord> selectReservedRecords(LocalDate date);
}
