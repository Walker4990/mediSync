package com.mediSync.project.controller;

import com.mediSync.project.service.TestFeeService;
import com.mediSync.project.vo.TestFee;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/testFee")
@RequiredArgsConstructor
public class TestFeeController {
    private final TestFeeService testFeeService;

    @GetMapping("/search")
    public List<TestFee> searchTestByKeyword(@RequestParam String keyword){
        return testFeeService.searchTestByKeyword(keyword);
    }

    @GetMapping("/{testCode}")
    public TestFee searchTestByCode(@PathVariable String testCode){
        return testFeeService.searchTestByCode(testCode);
    }
}
