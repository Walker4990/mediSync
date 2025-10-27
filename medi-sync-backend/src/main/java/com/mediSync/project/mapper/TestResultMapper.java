package com.mediSync.project.mapper;

import com.mediSync.project.vo.TestResult;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TestResultMapper {

    int insertTestResult(TestResult testResult);

    List<TestResult> findByReservationId(Long reservationId);
}
