package com.mediSync.project.medical.service;

import com.mediSync.project.medical.mapper.AdminAccountMapper;
import com.mediSync.project.medical.vo.AdminAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminAccountService {

    private final AdminAccountMapper adminAccountMapper;

    public List<AdminAccount> adminSelectAll() {
        return adminAccountMapper.selectAllAdmin();
    }
    public void adminInsert(AdminAccount vo){
        adminAccountMapper.insertAdmin(vo);
    }

}
