package com.mediSync.project.test.service;

import com.mediSync.project.test.mapper.TestFeeMapper;
import com.mediSync.project.test.vo.TestFee;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TestFeeService {
    private final TestFeeMapper testFeeMapper;

    public List<TestFee> searchTestByKeyword(String keyword){
        return testFeeMapper.searchTestByKeyword(keyword);
    }
    public TestFee searchTestByCode(String code){
        return testFeeMapper.searchTestByCode(code);
    }
}
