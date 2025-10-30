package com.mediSync.project.patient.mapper;

import com.mediSync.project.patient.dto.AccountDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface AccountMapper {
    List<AccountDTO> selectAllAdmin();
    AccountDTO selectAccountByEmpId(Long adminId);
    void insertAdmin(AccountDTO dto);
    int updateAdmin(AccountDTO dto);
    int deleteAdmin(Long adminId);

}