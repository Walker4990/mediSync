package com.mediSync.project.mapper;

import com.mediSync.project.vo.MedicalStaff;

import java.util.List;

public interface MedicalStaffMapper {
    List<MedicalStaff> findAllStaff();
    void addStaff(MedicalStaff staff);
    void updateStaff(MedicalStaff staff);
    void deleteStaff(Long staffId);
}
