package com.mediSync.project.medical.mapper;

import com.mediSync.project.medical.vo.UserAccount;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserAccountMapper {
    List<UserAccount> selectAllUser();
    UserAccount selectUserById(Long userId);
    int checkIdExists(@Param("loginId") String loginId);
    UserAccount selectUserByLoginId(@Param("loginId") String loginId);
    int insertUser(UserAccount vo);
    int updateUser(UserAccount vo);
    int deleteUser(Long userId);

    // 아이디 찾기
    String selectLoginIdByNameAndPhone(@Param("name") String name, @Param("phone") String phone);
    UserAccount selectUserForSendEmail(@Param("loginId") String loginId,
                                       @Param("name") String name,
                                       @Param("phone") String phone);

    // 비밀번호 재설정
    int updatePasswordByUserInfo(
            @Param("loginId") String loginId,
            @Param("password") String encodedPassword
    );
}