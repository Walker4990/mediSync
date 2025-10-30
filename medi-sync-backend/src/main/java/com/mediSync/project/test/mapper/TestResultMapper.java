package com.mediSync.project.test.mapper;

import com.mediSync.project.test.vo.TestResult;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface TestResultMapper {

    int insertTestResult(TestResult testResult);

    List<TestResult> findByReservationId(Long reservationId);
}
