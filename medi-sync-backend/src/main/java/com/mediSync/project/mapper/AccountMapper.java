package com.mediSync.project.mapper;

import com.mediSync.project.dto.AccountDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface AccountMapper {
    List<AccountDTO> selectAllAdmin();
    AccountDTO selectAccountByEmpId(Long adminId);
    void insertAdmin(AccountDTO dto);
    int updateAdmin(AccountDTO dto);
    int deleteAdmin(Long adminId);

    // provider와 providerId를 기준으로 사용자를 조회합니다. (예: "naver_1234")
    AccountDTO selectAccountByProviderId(String providerId);

     // 일반 로그인 ID(이메일 등)로 사용자를 조회합니다. (소셜 가입 시 loginId 중복 체크용)
    AccountDTO selectAccountByLoginId(String loginId);

    // 소셜 로그인 사용자를 USER_ACCOUNT 테이블에 저장합니다.
    void insertSocialUser(AccountDTO newAccount);
}