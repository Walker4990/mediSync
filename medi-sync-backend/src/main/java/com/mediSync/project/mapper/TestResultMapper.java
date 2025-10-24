package com.mediSync.project.mapper;

import com.mediSync.project.vo.TestResult;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TestResultMapper {

    int insertTestResult(TestResult testResult);

}
