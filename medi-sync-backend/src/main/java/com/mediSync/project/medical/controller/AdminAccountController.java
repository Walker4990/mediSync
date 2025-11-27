package com.mediSync.project.medical.controller;

import com.mediSync.project.config.JwtUtil;
import com.mediSync.project.medical.service.AdminAccountService;
import com.mediSync.project.medical.vo.AdminAccount;
import com.mediSync.project.medical.vo.UserAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admins")
@RequiredArgsConstructor
public class AdminAccountController {

    private final AdminAccountService adminAccountService;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // 전체 리스트
    @GetMapping
    public ResponseEntity<List<AdminAccount>> getAdminList() {
        return ResponseEntity.ok(adminAccountService.getAdminList());
    }
    // 개별 조회
    @GetMapping("/{adminId}")
    public ResponseEntity<AdminAccount> getMember(@PathVariable Long adminId) {
        return ResponseEntity.ok(adminAccountService.getMember(adminId));
    }

    // 회원가입
    @PostMapping
    public ResponseEntity<?> register(@RequestBody AdminAccount vo) {
        try {
            adminAccountService.adminInsert(vo);
            return ResponseEntity.ok("✅ 계정 등록 성공");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("❌ 등록 실패: " + e.getMessage());
        }
    }

    // 아이디 중복 체크
    @GetMapping("/check-empid")
    public Map<String, Object> checkDuplicateEmpId(@RequestParam String empId) {
        boolean exists = adminAccountService.isIdAvailable(empId);
        return Map.of("exists", exists);
    }

    // 의사 or 의료진 리스트 조회
    @GetMapping("/doctors")
    public ResponseEntity<List<AdminAccount>> getDoctorList() {
        return ResponseEntity.ok(adminAccountService.getDoctorList());
    }
    @GetMapping("/staffs")
    public ResponseEntity<List<AdminAccount>> getStaffList() {
        return ResponseEntity.ok(adminAccountService.getStaffList());
    }

    // 정보 수정
    @PutMapping({"/doctors/{adminId}", "/staffs/{adminId}"})
    public ResponseEntity<String> updateDoctor(@PathVariable Long adminId, @RequestBody AdminAccount vo) {
        vo.setAdminId(adminId);
        int rowsAffected = adminAccountService.adminUpdate(vo);
        if (rowsAffected > 0) {
            return ResponseEntity.ok("User updated successfully.");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 삭제 => 고용 해고 형태로 인사 관리 필요
    @DeleteMapping({"/doctors/{adminId}", "/staffs/{adminId}"})
    public ResponseEntity<String> deleteDoctor(@PathVariable Long adminId) {
        int rowsAffected = adminAccountService.adminDelete(adminId);
        if (rowsAffected > 0) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 로그인 기능 + 토큰 발급
    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> loginRequest) {
        String empId = loginRequest.get("emp_id");
        String password = loginRequest.get("password");

        AdminAccount admin = adminAccountService.selectAdminByEmpId(empId);

        if (admin != null && passwordEncoder.matches(password, admin.getPassword())) {

            // 🔥 여기만 변경
            String token = jwtUtil.generateAdminToken(
                    admin.getAdminId(),
                    admin.getEmpId()
            );
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
    public ResponseEntity<?> getAdminMyPage() {
        // 💡 SecurityContextHolder에서 인증된 객체 가져오기
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof AdminAccount) {
            AdminAccount admin = (AdminAccount) principal;
            // 💡 비밀번호 필드를 제외하고 사용자 정보를 반환하는 DTO를 사용하는 것이 더 안전합니다.
            return ResponseEntity.ok(admin);
        } else {
            // 인증 필터 (JwtFilter)가 실패하면 여기까지 오지 않겠지만, 안전 장치
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "인증된 사용자 정보를 찾을 수 없습니다."));
        }
    }

    @GetMapping("/recommanded")
    public List<AdminAccount> getRecommandedDoctor(){
        return adminAccountService.getRecommandedDoctor();
    }
}