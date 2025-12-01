package com.mediSync.project.patient.controller;

import com.mediSync.project.patient.dto.PatientDTO;
import com.mediSync.project.patient.service.PatientService;
import com.mediSync.project.medical.vo.MedicalRecord;
import com.mediSync.project.patient.vo.Patient;
import com.mediSync.project.medical.vo.Prescription;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    public Map<String, Object> allPatient(@RequestParam(defaultValue = "1") int page,
                                          @RequestParam(defaultValue = "10") int size,
                                          @RequestParam(required = false) String keyword) {
        return patientService.allPatients(page, size, keyword);
    }

    @GetMapping("/search")
    public List<Patient> searchPatient(String keyword){
        return patientService.searchPatient(keyword);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Patient patient) {
        try {
            patientService.register(patient);
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

    @GetMapping("/{patientId}/records")
    public Map<String, Object> getPatientRecords(@PathVariable("patientId") Long patientId,
                                                 @RequestParam(defaultValue = "1") int page,
                                                 @RequestParam(defaultValue = "10") int size) {
        return patientService.getPatientRecords(patientId, page, size);
    }

    @GetMapping("/{patientId}/prescriptions")
    public Map<String, Object> getPatientPrescriptions(@PathVariable("patientId") Long patientId,
                                                      @RequestParam(defaultValue = "1") int page,
                                                      @RequestParam(defaultValue = "10") int size) {
        return patientService.getPatientPrescriptions(patientId, page, size);
    }

    @GetMapping("/{patientId}/detail")
    public ResponseEntity<Patient> getPatientDetail(@PathVariable("patientId") Long patientId) {
        Patient patient = patientService.getPatientDetail(patientId);
        if(patient == null){
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(patient);
    }
    @GetMapping("/inpatients")
    public List<Map<String, Object>> selectInpatient() {
        return patientService.selectInpatient();
    }

    @GetMapping("/history/{patientId}")
    public List<Prescription> findByPatientId(@PathVariable("patientId") Long patientId) {
        return patientService.findByPatientId(patientId);
    }

    @GetMapping("/dashboard/{patientId}")
    public Map<String, Object> patientDashboard(@PathVariable("patientId") Long patientId) {
        return patientService.patientDashBoard(patientId);
    }
}
