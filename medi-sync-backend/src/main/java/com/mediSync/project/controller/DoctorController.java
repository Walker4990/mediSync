package com.mediSync.project.controller;

import com.mediSync.project.service.DoctorService;
import com.mediSync.project.vo.Doctor;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    @GetMapping
    public List<Doctor> findAllDoctor(@RequestParam(required = false) String department){
        System.out.println("department 넘어온 값 : "+department);
        if(department != null && !department.equals("전체 과목")){
            return doctorService.selectDoctorByDepartment(department);
        }
        else {
            return doctorService.selectAllDoctor();
        }
    }
 
    @PostMapping
    public ResponseEntity<?> insertDoctor(@RequestBody Doctor doctor) {
        try {
            doctorService.insertDoctor(doctor);
            return ResponseEntity
                    .status(HttpStatus.CREATED) // HTTP 201 Created는 생성 성공의 표준 응답 코드입니다.
                    .body(Map.of("success", true, "message", "의사 등록 완료"));
        } catch (DuplicateKeyException e) {
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

    @PutMapping
    public ResponseEntity<?> editDoctor(@RequestBody Doctor doctor) {
        try {
            doctorService.editDoctor(doctor);
            return ResponseEntity
                    .ok(Map.of("success", true, "message", "정보 수정 완료"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "수정 중 서버 오류 발생"));
        }
    }

    @DeleteMapping("/{doctorId}")
    public ResponseEntity<?> delDoctor(@PathVariable Long doctorId) {
        try {
            doctorService.delDoctor(doctorId);
            return ResponseEntity
                    .ok(Map.of("success", true, "message", "삭제 완료"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "삭제 중 서버 오류 발생"));
        }
    }
    @GetMapping("/fee/{doctorId}")
    public ResponseEntity<Map<String, Object>> getConsultFeeByDoctorId(@PathVariable Long doctorId) {
        Map<String, Object> feeInfo = doctorService.getConsultFeeByDoctorId(doctorId);
        if (feeInfo == null || feeInfo.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "해당 의사의 진료비 정보 없음"));
        }
        return ResponseEntity.ok(feeInfo);
        }
    }

