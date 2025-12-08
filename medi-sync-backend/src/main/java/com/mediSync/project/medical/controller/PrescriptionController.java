package com.mediSync.project.medical.controller;

import com.mediSync.project.medical.mapper.MedicalRecordMapper;
import com.mediSync.project.medical.service.PrescriptionService;
import com.mediSync.project.medical.vo.MedicalRecord;
import com.mediSync.project.medical.vo.Prescription;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.List;
import java.util.Map;
import java.util.UUID;

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
    public ResponseEntity<?> requestPrescriptionPdf(@PathVariable Long recordId) {

        String jobId = UUID.randomUUID().toString();

        prescriptionService.initJob(jobId);
        prescriptionService.generatePdfAsync(jobId, recordId);

        return ResponseEntity.ok(Map.of(
                "jobId", jobId,
                "status", "PENDING"
        ));
    }

    // =============================
    // PDF 생성 상태 조회
    // =============================
    @GetMapping("/pdf/status/{jobId}")
    public ResponseEntity<?> getPdfStatus(@PathVariable String jobId) {

        Map<String, Object> status = prescriptionService.getJobStatus(jobId);

        if (status == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(status);
    }

    @GetMapping("/pdf/download/{jobId}")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable String jobId) {

        // 서비스에서 상태 조회
        Map<String, Object> status = prescriptionService.getJobStatus(jobId);

        if (status == null || !"COMPLETED".equals(status.get("status"))) {
            return ResponseEntity.status(404).body(null);
        }

        // 실제 파일 찾기
        // 윈도우 개발환경 기준
        File dir = new File("C:/temp/pdfs/");
        File[] matches = dir.listFiles((d, name) -> name.startsWith(jobId + "_"));

        if (matches == null || matches.length == 0) {
            return ResponseEntity.status(404).body(null);
        }

        File pdfFile = matches[0];

        try {
            byte[] bytes = Files.readAllBytes(pdfFile.toPath());

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_TYPE, "application/pdf");
            headers.add(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"" + pdfFile.getName() + "\"");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(bytes);

        } catch (IOException e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // ✅ 입원환자 처방 내역 조회
    @GetMapping("/inpatient/list")
    public ResponseEntity<List<Prescription>> getInpatientPrescriptions() {
        return ResponseEntity.ok(prescriptionService.selectInpatientPrescriptions());
    }



}
