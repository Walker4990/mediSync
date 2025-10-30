package com.mediSync.project.controller;

import com.mediSync.project.service.UserAccountService;
import com.mediSync.project.vo.UserAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserAccountController {

    private final UserAccountService userAccountService;

    @GetMapping
    public List<UserAccount> getAllUsers() {
        return userAccountService.userSelectAll();
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserAccount> getUserById(@PathVariable Long userId) {
        UserAccount user = userAccountService.userSelectOne(userId);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> registerUser(@RequestBody UserAccount vo) {
        try {
            userAccountService.userInsert(vo);
        return ResponseEntity
                .status(HttpStatus.CREATED) // HTTP 201 Created는 생성 성공의 표준 응답 코드입니다.
                .body(Map.of("success", true, "message", "의사 등록 완료"));
    } catch (
    DuplicateKeyException e) {
        e.printStackTrace();
        return ResponseEntity
                .status(HttpStatus.CONFLICT) // HTTP 409 Conflict
                .body(Map.of("success", false, "message", "이미 등록된 정보입니다"));
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR) // HTTP 500
                .body(Map.of("success", false, "message", "서버 오류 발생"));
    }
}

    @PutMapping("/{userId}")
    public ResponseEntity<String> updateUser(@PathVariable Long userId, @RequestBody UserAccount vo) {
        vo.setUserId(userId);
        int rowsAffected = userAccountService.userUpdate(vo);
        if (rowsAffected > 0) {
            return ResponseEntity.ok("User updated successfully.");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable Long userId) {
        int rowsAffected = userAccountService.userDelete(userId);
        if (rowsAffected > 0) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}