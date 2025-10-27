package com.mediSync.project.mapper;

import com.mediSync.project.vo.TestFee;
import org.apache.ibatis.annotations.Mapper;

import java.math.BigDecimal;
import java.util.List;

@Mapper
public interface TestFeeMapper {
    List<TestFee> searchTestByKeyword(String keyword);
    TestFee searchTestByCode(String testCode);
    BigDecimal getTestFeeByName(String testName);
}
