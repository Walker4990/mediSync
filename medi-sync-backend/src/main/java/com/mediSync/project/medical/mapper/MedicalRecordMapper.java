package com.mediSync.project.medical.mapper;

import com.mediSync.project.medical.dto.MedicalRecordDTO;
import com.mediSync.project.medical.vo.MedicalRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Mapper
public interface MedicalRecordMapper {
    // 진료 등록
    int insertRecord(MedicalRecord record);
    // 진료 기록 전체 조회
    List<MedicalRecord> selectRecordAll();
    // 환자별 진료 기록 조회
    List<MedicalRecord> selectRecordAllByPatientId(Long patientId);

    // 페이징 포함 환자별 진료 기록 조회
    List<MedicalRecord> selectRecordAllByPatientIdWithPage(
            @Param("patientId") long patientId,
            @Param("offset") int offset,
            @Param("size") int size
    );
    // 환자 처방전 조회
    MedicalRecord selectRecordById(Long recordId);
    List<MedicalRecord> selectReservedRecords(LocalDate date);

    //환자 진료기록 상세 조회
    MedicalRecord selectRecordDetailByRecordId(long recordId);

    Map<String,Object> findById(@Param("recordId") Long recordId);
    int updateStatus(@Param("recordId") Long recordId, @Param("status") String status);
    int updateAmounts(@Param("recordId") Long recordId,
                      @Param("insuranceAmount") BigDecimal insuranceAmount,
                      @Param("patientPay") BigDecimal patientPay);
    }
