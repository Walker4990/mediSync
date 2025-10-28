package com.mediSync.project.service;

import com.mediSync.project.dto.AccountDTO;
import com.mediSync.project.mapper.AccountMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccountService {

    private final AccountMapper accountMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void registerAccount(AccountDTO dto) {
        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(dto.getPassword());
        dto.setPassword(encodedPassword);
        // DB 저장
        accountMapper.insertAdmin(dto);
    }

    public List<AccountDTO> selectAllAdmin() {
        return accountMapper.selectAllAdmin();
    }

    public AccountDTO selectAccountByEmpId(Long adminId) {
        return accountMapper.selectAccountByEmpId(adminId);
    }

    @Transactional
    public int updateAdmin(AccountDTO dto) {
        return accountMapper.updateAdmin(dto);
    }

    @Transactional
    public int deleteAdmin(Long adminId) {
        return accountMapper.deleteAdmin(adminId);
    }
}
