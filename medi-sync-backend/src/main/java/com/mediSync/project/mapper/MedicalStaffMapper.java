package com.mediSync.project.mapper;

import com.mediSync.project.vo.MedicalStaff;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface MedicalStaffMapper {
    List<MedicalStaff> findAllStaff();
    void addStaff(MedicalStaff staff);
    void updateStaff(MedicalStaff staff);
    void deleteStaff(Long staffId);
    List<MedicalStaff> searchStaffByKeyword(@Param("keyword") String keyword);
}
