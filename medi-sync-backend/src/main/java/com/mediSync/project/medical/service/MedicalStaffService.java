package com.mediSync.project.medical.service;

import com.mediSync.project.medical.mapper.MedicalStaffMapper;
import com.mediSync.project.medical.vo.AdminAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicalStaffService {
    private final MedicalStaffMapper medicalStaffMapper;

    public List<AdminAccount> findAllStaff(){
        return medicalStaffMapper.findAllStaff();
    }
    public void addStaff(AdminAccount staff) {
        medicalStaffMapper.addStaff(staff);
    }
    public void updateStaff(AdminAccount staff) {
        medicalStaffMapper.updateStaff(staff);
    }
    public void deleteStaff(Long staffId) {
        medicalStaffMapper.deleteStaff(staffId);
    }

    public List<AdminAccount> searchStaffByKeyword(String keyword) {
        return medicalStaffMapper.searchStaffByKeyword(keyword);
    }

}
