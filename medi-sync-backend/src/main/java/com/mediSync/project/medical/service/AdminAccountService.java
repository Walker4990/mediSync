package com.mediSync.project.medical.service;

import com.mediSync.project.medical.mapper.AdminAccountMapper;
import com.mediSync.project.medical.vo.AdminAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

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

    // 일반 정보 수정 (비밀번호 제외)
    public int adminUpdate(AdminAccount vo){
        // 명시적으로 null 처리하여 Mapper에서 무시
        vo.setPassword(null);
        return adminAccountMapper.updateAdmin(vo);
    }

    // 비밀번호 변경 전용 메서드
    public int updatePassword(Long adminId, String newPassword) {
        AdminAccount vo = new AdminAccount();
        vo.setAdminId(adminId);
        // 새 비밀번호를 암호화하여 VO에 설정
        vo.setPassword(passwordEncoder.encode(newPassword));
        return adminAccountMapper.updateAdmin(vo);
    }

    public int adminDelete(Long adminId) {
        return adminAccountMapper.deleteAdmin(adminId);
    }

    public AdminAccount selectAdminByEmpId(String empId) {
        return adminAccountMapper.loginAdmin(empId);
    }
    public AdminAccount login(String empId, String password) {
        AdminAccount admin = adminAccountMapper.loginAdmin(empId);
        if (admin == null) {
            return null;
        }
        if (passwordEncoder.matches(password, admin.getPassword())) {
            return admin;
        } else {
            return null;
        }
    }
    public List<AdminAccount> getRecommandedDoctor() {
        List<AdminAccount> list = adminAccountMapper.getRecommandedDoctor();
        Collections.shuffle(list);
        return list.stream().limit(3).collect(Collectors.toList());
    }
}