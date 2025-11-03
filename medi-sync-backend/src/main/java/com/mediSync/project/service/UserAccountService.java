package com.mediSync.project.service;

import com.mediSync.project.mapper.UserAccountMapper;
import com.mediSync.project.vo.UserAccount;
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
    public void userInsert(UserAccount vo){
        userAccountMapper.insertUser(vo);
    }
    public int userUpdate(UserAccount vo) {
        return userAccountMapper.updateUser(vo);
    }
    public int userDelete(Long userId) {
        return userAccountMapper.deleteUser(userId);
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
}
