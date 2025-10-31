package com.mediSync.project.medical.controller;

import com.mediSync.project.medical.service.DepartmentService;
import com.mediSync.project.medical.vo.Department;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    public List<Department> selectAllDept() {
        return departmentService.selectAllDept();
    }

}