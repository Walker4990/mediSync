package com.mediSync.project.medical.service;

import com.mediSync.project.medical.mapper.UserAccountMapper;

import com.mediSync.project.medical.vo.UserAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserAccountService {

    private final UserAccountMapper userAccountMapper;

    public List<UserAccount> userSelectAll() {
        return userAccountMapper.selectAllUser();
    }
    public UserAccount userSelectOne(Long userId) {
        return userAccountMapper.selectUserById(userId);
    }
    public boolean isLoginIdAvailable(String loginId){
        int count = userAccountMapper.checkIdExists(loginId);
        return count == 0; // 0이면 사용 가능
    }
    public void userInsert(UserAccount vo){
        userAccountMapper.insertUser(vo);
    }
    public int userUpdate(UserAccount vo) {
        return userAccountMapper.updateUser(vo);
    }
    public int userDelete(Long userId) {
        return userAccountMapper.deleteUser(userId);
    }

    public UserAccount selectUserByLoginId(String loginId) {
        return userAccountMapper.selectUserByLoginId(loginId);
    }
    public UserAccount login(String loginId, String password) {
        UserAccount user = userAccountMapper.selectUserByLoginId(loginId);
            if (user == null) {
                return null;
            }
            if (user.getPassword().equals(password)) {
                return user;
            } else {
                return null;
        }
    }
    public String findLoginIdByNameAndPhone(String name, String phone) {
        return userAccountMapper.selectLoginIdByNameAndPhone(name, phone);
    }
    public  UserAccount findUserForSendEmail(String loginId, String name, String phone){
        return userAccountMapper.selectUserForSendEmail(loginId, name, phone);
    }
    public int resetPassword(String loginId, String encodedPassword) {
        return userAccountMapper.updatePasswordByUserInfo(loginId, encodedPassword);
    }
}
