package com.mediSync.project.mapper;

import com.mediSync.project.vo.Department;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface DepartmentMapper {
    List<Department> deptSelectAll();

}
