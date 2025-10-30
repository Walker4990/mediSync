package com.mediSync.project.patient.controller;

import com.mediSync.project.patient.dto.AccountDTO;
import com.mediSync.project.patient.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    public List<AccountDTO> selectAllAccount() {
        return accountService.selectAllAccount();
    }

    @PostMapping
    public ResponseEntity<?> insertDoctor(@RequestBody AccountDTO dto) {
        try {
            accountService.insertAdmin(dto);
            return ResponseEntity
                    .status(HttpStatus.CREATED) // HTTP 201 Created는 생성 성공의 표준 응답 코드입니다.
                    .body(Map.of("success", true, "message", "계정 등록 완료"));
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


}