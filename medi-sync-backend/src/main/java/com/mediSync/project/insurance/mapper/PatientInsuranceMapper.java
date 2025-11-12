package com.mediSync.project.insurance.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface PatientInsuranceMapper {
    int deleteByPatientId(@Param("patientId") Long patientId);

    int bulkInsert(@Param("patientId") Long patientId, @Param("items") List<Map<String, Object>> items);

    List<Map<String, Object>> selectByPatientIdOrderByCoverageDesc(@Param("patientId") Long patientId);

    List<Map<String, Object>> selectClaimHistoryByPatient(@Param("patientId") Long patientId);
    int upsertInsurance(Map<String, Object> data);
}
