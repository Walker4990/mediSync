package com.mediSync.project.medical.mapper;

import com.mediSync.project.medical.vo.AdminAccount;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminAccountMapper {
    List<AdminAccount> selectAllAdmin();
    List<AdminAccount> selectAllDoctor();
    List<AdminAccount> selectAllStaff();
    AdminAccount selectOneAdmin(Long adminId);
    void insertAdmin(AdminAccount vo);
    int checkIdExists(@Param("empId") String empId);
    int updateAdmin(AdminAccount vo);
    int deleteAdmin(Long adminId);
    AdminAccount loginAdmin(@Param("empId") String empId);
    List<AdminAccount> getRecommandedDoctor();

}