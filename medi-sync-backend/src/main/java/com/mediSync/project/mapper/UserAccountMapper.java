package com.mediSync.project.mapper;

import com.mediSync.project.vo.UserAccount;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface UserAccountMapper {
    List<UserAccount> selectAllUser();
    UserAccount selectUserById(Long userId);
    void insertUser(UserAccount vo);
    int updateUser(UserAccount vo);
    int deleteUser(Long userId);

}