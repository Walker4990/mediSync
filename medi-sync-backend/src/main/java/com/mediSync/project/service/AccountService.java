package com.mediSync.project.service;

import com.mediSync.project.dto.AccountDTO;
import com.mediSync.project.mapper.AccountMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final AccountMapper accountMapper;

    public List<AccountDTO> selectAllAccount(){
        return accountMapper.accountSelectAll();
    }
    public void insertAdmin(AccountDTO dto) {
        accountMapper.insertAdmin(dto);
    }
}




