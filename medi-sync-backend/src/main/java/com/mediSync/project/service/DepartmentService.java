package com.mediSync.project.service;


import com.mediSync.project.mapper.DepartmentMapper;
import com.mediSync.project.vo.Department;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DepartmentService {
    private final DepartmentMapper departmentMapper;

    public List<Department> selectAllDept(){
        return departmentMapper.deptSelectAll();
    }
}




