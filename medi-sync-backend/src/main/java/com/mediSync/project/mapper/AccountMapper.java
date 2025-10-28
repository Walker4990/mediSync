package com.mediSync.project.mapper;

import com.mediSync.project.dto.AccountDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface AccountMapper {
    List<AccountDTO> accountSelectAll();
    void insertAdmin(AccountDTO dto);
}