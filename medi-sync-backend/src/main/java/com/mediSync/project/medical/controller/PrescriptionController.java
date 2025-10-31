package com.mediSync.project.medical.controller;

import com.mediSync.project.medical.mapper.MedicalRecordMapper;
import com.mediSync.project.medical.service.PrescriptionService;
import com.mediSync.project.medical.vo.MedicalRecord;
import com.mediSync.project.medical.vo.Prescription;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final MedicalRecordMapper medicalRecordMapper;

    @GetMapping
    public List<Prescription> selectPrescriptions(){
        return prescriptionService.selectPrescriptions();
    }

    @GetMapping("/{recordId}")
    public List<Prescription> selectPrescriptionsByPatientId(@PathVariable Long recordId){
        return prescriptionService.selectPrescriptionsById(recordId);
    }

    @PostMapping("/add")
    public String insertPrescription(@RequestBody Prescription prescription){
        prescriptionService.insertPrescription(prescription);
        return "success";
    }

    @GetMapping("/pdf/{recordId}")
    public ResponseEntity<byte[]> generatePrescriptionPdf(@PathVariable Long recordId) {
        byte[] pdfData = prescriptionService.generatePrescriptionPdf(recordId);
        MedicalRecord record = medicalRecordMapper.selectRecordById(recordId); // ✅ 환자 정보 조회

        // ✅ 파일명: yyyy-MM-dd_이름_처방전.pdf
        String today = java.time.LocalDate.now().toString();
        String rawFileName = today + "_" + record.getPatientName() + "_처방전.pdf";
        String fileName = URLEncoder.encode(rawFileName, StandardCharsets.UTF_8);

        // ✅ 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/pdf");
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfData);
    }

    // ✅ 입원환자 처방 내역 조회
    @GetMapping("/inpatient/list")
    public ResponseEntity<List<Prescription>> getInpatientPrescriptions() {
        return ResponseEntity.ok(prescriptionService.selectInpatientPrescriptions());
    }



}
