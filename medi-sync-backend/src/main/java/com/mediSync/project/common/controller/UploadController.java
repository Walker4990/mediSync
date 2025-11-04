package com.mediSync.project.common.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
        import org.springframework.web.multipart.MultipartFile;

import java.io.*;
        import java.nio.file.*;
        import java.util.*;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    @Value("${app.upload.dir:uploads/profile}")
    private String uploadDir;

    // 업로드 엔드포인트
    @PostMapping("/profile")
    public ResponseEntity<?> uploadProfile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "파일이 비어있습니다."));
        }

        // 파일 타입 검사 (이미지만)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "이미지 파일만 업로드 가능합니다."));
        }

        try {
            // 디렉터리 생성
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            // 안전한 파일명 + UUID
            String orig = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            String ext = "";
            int dot = orig.lastIndexOf('.');
            if (dot >= 0) ext = orig.substring(dot);
            String filename = UUID.randomUUID().toString() + ext;

            Path target = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            // 접근 가능한 URL 생성 — 예: http://localhost:8080/uploads/profile/{filename}
            String fileUrl = "/uploads/profile/" + filename;

            return ResponseEntity.ok(Map.of("url", fileUrl));
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "파일 저장 실패"));
        }
    }
}
