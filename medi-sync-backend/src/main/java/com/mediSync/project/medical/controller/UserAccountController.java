package com.mediSync.project.medical.controller;

import com.mediSync.project.config.JwtUtil;
import com.mediSync.project.medical.service.UserAccountService;
import com.mediSync.project.medical.vo.UserAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserAccountController {

    private final UserAccountService userAccountService;
    private final PasswordEncoder passwordEncoder;

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
            // 비밀번호 암호화
            vo.setPassword(passwordEncoder.encode(vo.getPassword()));
            userAccountService.userInsert(vo);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("success", true, "message", "회원 등록 완료"));
        } catch (DuplicateKeyException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", "이미 등록된 정보입니다"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "서버 오류 발생"));
        }
    }

    // 아이디 중복 체크
    @GetMapping("/check-id")
    public Map<String, Object> checkLoginId(@RequestParam String loginId) {
        boolean available = userAccountService.isLoginIdAvailable(loginId);
        return Map.of("available", available);
    }

    // 로그인 기능 + 토큰 발급
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String loginId = loginRequest.get("login_id");
        String password = loginRequest.get("password");

        UserAccount user = userAccountService.selectUserByLoginId(loginId);

        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            // JWT 생성 (payload: loginId, userId)
            String token = jwtUtil.generateToken(user.getLoginId(), user.getUserId());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "token", token,
                    "message", "로그인 성공"
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "아이디 또는 비밀번호가 일치하지 않습니다."));
        }
    }

    // 마이페이지
    @GetMapping("/mypage")
    public ResponseEntity<?> getMyPage(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "토큰이 없습니다."));
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "토큰이 유효하지 않습니다."));
        }

        String loginId = jwtUtil.extractLoginId(token);
        UserAccount user = userAccountService.selectUserByLoginId(loginId);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "사용자 정보를 찾을 수 없습니다."));
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

    // 아이디 찾기
    @PostMapping("/find-id")
    public ResponseEntity<?> findId(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String phone = request.get("phone");
        String loginId = userAccountService.findLoginIdByNameAndPhone(name, phone);
        if (loginId != null) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "loginId", loginId, // 찾은 아이디 반환
                    "message", "아이디를 찾았습니다."
            ));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "일치하는 사용자 정보가 없습니다."));
        }
    }

    // 비밀번호 재설정
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String loginId = request.get("login_id");
        String name = request.get("name");
        String phone = request.get("phone");
        String newPassword = request.get("new_password");
        // 새로운 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(newPassword);
        // 변경된 비밀번호 업데이트
        int rowsAffected = userAccountService.resetPassword(loginId, name, phone, encodedPassword);
        if (rowsAffected > 0) {
            return ResponseEntity.ok(Map.of("success", true, "message", "비밀번호가 성공적으로 변경되었습니다."));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "사용자 정보가 일치하지 않습니다."));
        }
    }
}