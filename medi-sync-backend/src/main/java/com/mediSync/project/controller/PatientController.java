package com.mediSync.project.controller;

import com.mediSync.project.dto.PatientDTO;
import com.mediSync.project.service.PatientService;
import com.mediSync.project.vo.Patient;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    public List<Patient> allPatient() {
        return patientService.allPatients();
    }
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody PatientDTO dto) {
        try {
            patientService.register(dto);
            return ResponseEntity
                    .ok(Map.of("success", true, "message", "등록 완료"));
        } catch (DuplicateKeyException e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", "이미 존재하는 회원입니다"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "서버 오류 발생"));
        }
    }

}
