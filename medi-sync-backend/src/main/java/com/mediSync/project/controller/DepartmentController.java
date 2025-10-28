package com.mediSync.project.controller;

import com.mediSync.project.service.DepartmentService;
import com.mediSync.project.vo.Department;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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