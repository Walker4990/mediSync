package com.mediSync.project.medical.controller;

import com.mediSync.project.config.JwtUtil;
import com.mediSync.project.medical.service.AdminAccountService;
import com.mediSync.project.medical.vo.AdminAccount;
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
    @GetMapping("/doctors")
    public ResponseEntity<List<AdminAccount>> getDoctorList() {
        List<AdminAccount> doctors = adminAccountService.getDoctorList();
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<AdminAccount>> getDoctorList() {
        List<AdminAccount> doctors = adminAccountService.getDoctorList();
        return ResponseEntity.ok(doctors);
    }

    // 회원가입
    @PostMapping
    public ResponseEntity<?> register(@RequestBody AdminAccount vo) {
        try {
            vo.setRole("ADMIN");
            adminAccountService.adminInsert(vo);
            return ResponseEntity.ok("✅ 계정 등록 성공");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("❌ 등록 실패: " + e.getMessage());
        }
    }
}