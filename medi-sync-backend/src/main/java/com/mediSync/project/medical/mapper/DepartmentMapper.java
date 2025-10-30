package com.mediSync.project.medical.mapper;

import com.mediSync.project.medical.vo.Department;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface DepartmentMapper {
    List<Department> deptSelectAll();

}
