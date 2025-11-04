package com.mediSync.project.medical.controller;

import com.mediSync.project.medical.service.UserAccountService;

import com.mediSync.project.medical.vo.UserAccount;
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String loginId = loginRequest.get("login_id");
        String password = loginRequest.get("password");

        // 1. 서비스 호출하여 로그인 시도
        UserAccount loggedInUser = userAccountService.login(loginId, password);
        if (loggedInUser != null) {
            // 2. 로그인 성공 - 실제 JWT 인증 환경이라면, 여기서 JWT 토큰을 생성하여 반환해야 합니다.
            return ResponseEntity.ok(
                    Map.of("success", true, "message", "로그인 성공", "user", loggedInUser)
            );
        } else {
            // 3. 로그인 실패 (ID 없음 또는 비밀번호 불일치)
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED) // HTTP 401 Unauthorized
                    .body(Map.of("success", false, "message", "아이디 또는 비밀번호가 일치하지 않습니다."));
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