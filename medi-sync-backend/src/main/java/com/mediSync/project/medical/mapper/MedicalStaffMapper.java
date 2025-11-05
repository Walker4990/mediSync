package com.mediSync.project.medical.mapper;

import com.mediSync.project.medical.vo.AdminAccount;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface MedicalStaffMapper {
    List<AdminAccount> findAllStaff();
    void addStaff(AdminAccount staff);
    void updateStaff(AdminAccount staff);
    void deleteStaff(Long staffId);
    List<AdminAccount> searchStaffByKeyword(@Param("keyword") String keyword);
}
