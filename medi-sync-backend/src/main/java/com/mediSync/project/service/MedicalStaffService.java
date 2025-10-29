package com.mediSync.project.service;

import com.mediSync.project.mapper.MedicalStaffMapper;
import com.mediSync.project.vo.MedicalStaff;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicalStaffService {
    private final MedicalStaffMapper medicalStaffMapper;

    public List<MedicalStaff> findAllStaff(){
        return medicalStaffMapper.findAllStaff();
    }
    public void addStaff(MedicalStaff staff) {
        medicalStaffMapper.addStaff(staff);
    }
    public void updateStaff(MedicalStaff staff) {
        medicalStaffMapper.updateStaff(staff);
    }
    public void deleteStaff(Long staffId) {
        medicalStaffMapper.deleteStaff(staffId);
    }

    public List<MedicalStaff> searchStaffByKeyword(String keyword) {
        return medicalStaffMapper.searchStaffByKeyword(keyword);
    }

}
