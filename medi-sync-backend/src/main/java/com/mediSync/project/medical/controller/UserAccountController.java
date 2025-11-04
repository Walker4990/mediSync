package com.mediSync.project.medical.controller;

import com.mediSync.project.config.JwtUtil;
import com.mediSync.project.medical.service.UserAccountService;
import com.mediSync.project.medical.vo.UserAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserAccountController {

    private final UserAccountService userAccountService;

    @Autowired
    private JwtUtil jwtUtil;

    // 전체 리스트
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

    // 회원가입
    @PostMapping
    public ResponseEntity<?> registerUser(@RequestBody UserAccount vo) {
        try {
            userAccountService.userInsert(vo);
        return ResponseEntity
                .status(HttpStatus.CREATED) // HTTP 201 Created는 생성 성공의 표준 응답 코드입니다.
                .body(Map.of("success", true, "message", "회원 등록 완료"));
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

    // 아이디 중복 체크
    @GetMapping("/check-id")
    public Map<String, Object> checkLoginId(@RequestParam String loginId) {
        boolean available = userAccountService.isLoginIdAvailable(loginId);

        Map<String, Object> response = new HashMap<>();
        response.put("available", available);
        System.out.println(response);
        return response;
    }

    // 로그인 기능 + 토큰 발급
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String loginId = loginRequest.get("login_id");
        String password = loginRequest.get("password");

        UserAccount loggedInUser = userAccountService.login(loginId, password);

        if (loggedInUser != null) {
            // JWT 생성
            // String token = jwtUtil.generateToken(loginId);
            return ResponseEntity.ok(Map.of(
                    "success", true
                    ));
        } else {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "아이디 또는 비밀번호가 일치하지 않습니다."));
        }
    }

    // 마이페이지
    @GetMapping("/mypage")
    public ResponseEntity<?> getMyPage(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "토큰이 없습니다."));
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "토큰이 유효하지 않습니다."));
        }

        // 토큰에서 loginId 추출
        String loginId = jwtUtil.extractLoginId(token);
        // DB에서 유저 정보 조회
        UserAccount user = userAccountService.selectUserByLoginId(loginId);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "사용자 정보를 찾을 수 없습니다."));
        }

        return ResponseEntity.ok(user);
    }

    // 수정
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

    // 삭제
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