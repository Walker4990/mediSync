package com.mediSync.project.test.controller;

import com.mediSync.project.test.dto.LisResultDTO;
import com.mediSync.project.test.service.TestResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;


@RestController
@RequestMapping("/api/testResult")
@RequiredArgsConstructor
public class TestResultController {

    private final TestResultService testResultService;

    // ✅ 검사결과 PDF 다운로드
    @GetMapping("/{reservationId}/pdf")
    public ResponseEntity<byte[]> downloadTestResultPdf(@PathVariable Long reservationId) {
        byte[] pdfBytes = testResultService.generateTestResultPdf(reservationId);

        String fileName = URLEncoder.encode("검사결과_" + reservationId + ".pdf", StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName)
                .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
                .body(pdfBytes);
    }
    @PostMapping("/mock")
    public ResponseEntity<String> mockLisResult(@RequestBody LisResultDTO dto) {
        testResultService.processLisResult(dto);
        return ResponseEntity.ok("✅ Mock LIS 검사 결과가 저장되었습니다.");
    }
}

