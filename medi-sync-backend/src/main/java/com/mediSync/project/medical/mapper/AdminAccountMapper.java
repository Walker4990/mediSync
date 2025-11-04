package com.mediSync.project.medical.mapper;

import com.mediSync.project.medical.vo.AdminAccount;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface AdminAccountMapper {
    List<AdminAccount> selectAllAdmin();
    void insertAdmin(AdminAccount vo);

}