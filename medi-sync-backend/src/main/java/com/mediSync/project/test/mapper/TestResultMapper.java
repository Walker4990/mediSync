package com.mediSync.project.test.mapper;

import com.mediSync.project.test.vo.TestResult;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TestResultMapper {

    int insertTestResult(TestResult testResult);

    List<TestResult> findByReservationId(Long reservationId);

    List<TestResult> getResultsByPatients(@Param("patientId") Long patientId, int offset, int size);
    TestResult getResultDetail(Long testResultId);
    int countAll(@Param("patientId") Long patientId);
}
