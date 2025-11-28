package com.mediSync.project.medical.controller;

import com.mediSync.project.config.JwtUtil;
import com.mediSync.project.medical.service.AdminAccountService;
import com.mediSync.project.medical.vo.AdminAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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

    // 정보 수정 (관리자용)
    // 이 엔드포인트도 이제 동적 SQL을 통해 VO의 모든 필드를 보낼 필요 없이 필요한 필드만 보낼 수 있습니다.
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
            // 토큰 생성 시 password는 null 처리하여 반환 객체에서 제외
            String token = jwtUtil.generateToken(admin.getEmpId(), admin.getAdminId());
            admin.setPassword(null);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "token", token,
                    "admin", admin,
                    "message", "로그인 성공"
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "아이디 또는 비밀번호가 일치하지 않습니다."));
        }
    }

    // 마이페이지 조회
    @GetMapping("/mypage")
    public ResponseEntity<?> getAdminMyPage() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof AdminAccount) {
            AdminAccount admin = (AdminAccount) principal;
            // 보안을 위해 비밀번호 필드를 제외하고 반환
            admin.setPassword(null);
            return ResponseEntity.ok(admin);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "인증된 사용자 정보를 찾을 수 없습니다."));
        }
    }

    // 마이페이지 정보 수정 (개인 정보 업데이트)
    @PutMapping("/mypage")
    public ResponseEntity<?> updateMyPage(@RequestBody AdminAccount vo) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof AdminAccount) {
            AdminAccount currentAdmin = (AdminAccount) principal;
            // 현재 로그인된 사용자의 adminId를 VO에 설정 (본인 확인)
            vo.setAdminId(currentAdmin.getAdminId());

            // adminUpdate 서비스 호출 (Mapper의 동적 SQL이 null이 아닌 필드만 업데이트 처리)
            int rowsAffected = adminAccountService.adminUpdate(vo);

            if (rowsAffected > 0) {
                // 업데이트 후 최신 정보를 DB에서 다시 조회하여 반환
                AdminAccount updatedAdmin = adminAccountService.getMember(currentAdmin.getAdminId());
                updatedAdmin.setPassword(null); // 비밀번호 제외
                return ResponseEntity.ok(updatedAdmin);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("정보 수정 실패");
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
    }

    // 마이페이지 비밀번호 변경 (전용 엔드포인트)
    @PutMapping("/{adminId}/password")
    public ResponseEntity<?> updatePassword(@PathVariable Long adminId, @RequestBody Map<String, String> request) {
        String newPassword = request.get("password");

        if (newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body("새 비밀번호를 입력해야 합니다.");
        }

        // 1. 현재 로그인된 사용자가 요청된 ID의 본인이 맞는지 확인 (보안)
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof AdminAccount)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증 실패.");
        }
        AdminAccount currentAdmin = (AdminAccount) principal;
        if (!currentAdmin.getAdminId().equals(adminId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("본인의 비밀번호만 변경할 수 있습니다.");
        }

        // 2. 비밀번호 업데이트 서비스 호출 (updatePassword 전용 메서드 사용)
        int rowsAffected = adminAccountService.updatePassword(adminId, newPassword);

        if (rowsAffected > 0) {
            return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
        } else {
            // 이 오류는 주로 adminId가 DB에 없거나 DB 연결 문제일 경우 발생합니다.
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("비밀번호 변경 중 오류 발생. 대상 ID를 찾을 수 없거나 DB 오류.");
        }
    }

    @GetMapping("/recommanded")
    public List<AdminAccount> getRecommandedDoctor(){
        return adminAccountService.getRecommandedDoctor();
    }
}