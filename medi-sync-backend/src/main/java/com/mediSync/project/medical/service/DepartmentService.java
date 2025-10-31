package com.mediSync.project.medical.service;


import com.mediSync.project.medical.mapper.DepartmentMapper;
import com.mediSync.project.medical.vo.Department;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {
    private final DepartmentMapper departmentMapper;

    public List<Department> selectAllDept(){
        return departmentMapper.deptSelectAll();
    }
}




