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
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admins")
@RequiredArgsConstructor
public class AdminAccountController {

    private final AdminAccountService adminAccountService;

    @Autowired
    private JwtUtil jwtUtil;

    // 전체 리스트
    @GetMapping
    public ResponseEntity<List<AdminAccount>> getAdminList() {
        return ResponseEntity.ok(adminAccountService.getAdminList());
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
//    @DeleteMapping({"/doctors/{adminId}", "/staffs/{adminId}"})
//    public ResponseEntity<String> deleteDoctor(@PathVariable Long adminId) {
//        int rowsAffected = adminAccountService.adminDelete(adminId);
//        if (rowsAffected > 0) {
//            return ResponseEntity.noContent().build();
//        } else {
//            return ResponseEntity.notFound().build();
//        }
//    }

}