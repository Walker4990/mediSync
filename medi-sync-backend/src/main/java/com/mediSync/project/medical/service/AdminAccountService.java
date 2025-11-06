package com.mediSync.project.medical.service;

import com.mediSync.project.medical.mapper.AdminAccountMapper;
import com.mediSync.project.medical.vo.AdminAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminAccountService {

    private final AdminAccountMapper adminAccountMapper;
    private final PasswordEncoder passwordEncoder;

    public List<AdminAccount> getAdminList() {
        return adminAccountMapper.selectAllAdmin();
    }
    public AdminAccount getMember(Long adminId) {
        return adminAccountMapper.selectOneAdmin(adminId);
    }
    public List<AdminAccount> getDoctorList() {
        return adminAccountMapper.selectAllDoctor();
    }
    public List<AdminAccount> getStaffList() {
        return adminAccountMapper.selectAllStaff();
    }
    public void adminInsert(AdminAccount vo){
        vo.setPassword(passwordEncoder.encode(vo.getPassword()));
        adminAccountMapper.insertAdmin(vo);
    }
    public boolean isIdAvailable(String empId){
        return adminAccountMapper.checkIdExists(empId) > 0;
    }

    public int adminUpdate(AdminAccount vo){
        if (vo.getPassword() != null && !vo.getPassword().trim().isEmpty()) {
            vo.setPassword(passwordEncoder.encode(vo.getPassword())); // 변경할 때만 암호화
        } else {
            vo.setPassword(null); // Mapper에서 update 시 password 필드 제외하도록 처리
        }
        return adminAccountMapper.updateAdmin(vo);
    }
    public int adminDelete(Long adminId) {
        return adminAccountMapper.deleteAdmin(adminId);
    }
}
