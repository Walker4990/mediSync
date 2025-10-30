package com.mediSync.project.medical.controller;

import com.mediSync.project.medical.service.MedicalStaffService;
import com.mediSync.project.medical.vo.MedicalStaff;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staffs")
@RequiredArgsConstructor
public class MedicalStaffController {

    private final MedicalStaffService medicalStaffService;

    @GetMapping
    public List<MedicalStaff> findAllStaff() {
        return medicalStaffService.findAllStaff();
    }

    @PostMapping
    public ResponseEntity<?> addStaff(@RequestBody MedicalStaff staff) {
        try {
            medicalStaffService.addStaff(staff);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of("success", true, "message", "의료진 등록 완료"));
        } catch (DuplicateKeyException e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", "이미 등록된 면허/자격 정보입니다"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "의료진 등록 중 서버 오류 발생"));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateStaff(@RequestBody MedicalStaff staff) {
        try {
            medicalStaffService.updateStaff(staff);
            return ResponseEntity
                    .ok(Map.of("success", true, "message", "정보 수정 완료"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "수정 중 서버 오류 발생"));
        }
    }

    @DeleteMapping("/{staffId}")
    public ResponseEntity<?> deleteStaff(@PathVariable Long staffId) {
        try {
            medicalStaffService.deleteStaff(staffId);
            return ResponseEntity
                    .ok(Map.of("success", true, "message", "삭제 완료"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "삭제 중 서버 오류 발생"));
        }
    }
    @GetMapping("/search")
    public List<MedicalStaff> searchStaffByKeyword(String keyword) {
        return medicalStaffService.searchStaffByKeyword(keyword);
    }
}
