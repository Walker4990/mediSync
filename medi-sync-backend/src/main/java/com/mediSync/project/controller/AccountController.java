package com.mediSync.project.controller;

import com.mediSync.project.dto.AccountDTO;
import com.mediSync.project.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<?> registerAccount(@RequestBody AccountDTO dto) {
        try {
            if (dto.getEmpId() == null || dto.getPassword() == null || dto.getName() == null) {
                return ResponseEntity.badRequest().body("필수 입력 항목을 채워주세요.");
            }
            accountService.registerAccount(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body("계정이 성공적으로 등록되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("등록 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<AccountDTO>> getAllAccounts() {
        List<AccountDTO> list = accountService.selectAllAdmin();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{adminId}")
    public ResponseEntity<AccountDTO> getAccountDetails(@PathVariable Long adminId) {
        AccountDTO account = accountService.selectAccountByEmpId(adminId);
        if (account == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(account);
    }

    @PutMapping
    public ResponseEntity<?> updateAccount(@RequestBody AccountDTO dto) {
        try {
            int updated = accountService.updateAdmin(dto);
            if (updated > 0) {
                return ResponseEntity.ok("계정 정보가 성공적으로 수정되었습니다.");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("수정할 계정을 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("수정 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @DeleteMapping("/{adminId}")
    public ResponseEntity<?> deleteAccount(@PathVariable Long adminId) {
        try {
            int deleted = accountService.deleteAdmin(adminId);
            if (deleted > 0) {
                return ResponseEntity.ok("계정이 성공적으로 삭제되었습니다.");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("삭제할 계정을 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("삭제 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}
