package com.mediSync.project.medical.controller;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.mediSync.project.config.JwtUtil;
import com.mediSync.project.medical.service.UserAccountService;
import com.mediSync.project.medical.vo.UserAccount;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserAccountController {

    private final UserAccountService userAccountService;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // application.properties에서 설정값 주입
    @Value("${spring.security.oauth2.client.registration.naver.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.naver.client-secret}")
    private String clientSecret;

    @Value("${spring.security.oauth2.client.provider.naver.token-uri}")
    private String tokenUri;

    // 전체 리스트
    @GetMapping
    public List<UserAccount> getAllUsers() {
        return userAccountService.userSelectAll();
    }

    @GetMapping("/test")
    public void getTest(@RequestParam String code, @RequestParam String state) {
        RestTemplate restTemplate = new RestTemplate();

        // 1. 요청 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // 2. 요청 파라미터(Body) 설정
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("code", code);
        params.add("state", state);
        // (참고: 네이버의 경우 redirect_uri는 토큰 요청 시 필수는 아님)

        // 3. HttpEntity (헤더 + 바디) 생성
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        // 2. 서비스 호출하여 Access Token 받기
        String accessToken = getNaverAccessTokenTest(code, state);

        System.out.println(accessToken);

        // 4. POST 요청 보내기 (네이버 토큰 URI로)
        //ResponseEntity<NaverTokenResponse> response = restTemplate.postForEntity(
        //        tokenUri,
        //        request,
        //        NaverTokenResponse.class // 응답을 매핑할 DTO 클래스
        //);

        // 5. 응답에서 Access Token 꺼내기
        //if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
        //    return response.getBody().getAccess_token();
        //} else {
        //    throw new RuntimeException("네이버 토큰 발급에 실패했습니다. 응답: " + response);
        //}
    }

    public String getNaverAccessTokenTest(String code, String state) {

        // 1. RestTemplate 객체 생성
        RestTemplate restTemplate = new RestTemplate();

        // 2. HTTP 요청 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        // 네이버 토큰 요청은 'application/x-www-form-urlencoded' 타입을 사용합니다.
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // 3. HTTP 요청 바디(Body) 설정 (필수 파라미터)
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("code", code);
        params.add("state", state);
        // (참고: 네이버의 경우 redirect_uri는 토큰 요청 시 필수는 아님)

        // 4. 헤더와 바디를 하나의 HttpEntity 객체로 합치기
        HttpEntity<MultiValueMap<String, String>> naverTokenRequest =
                new HttpEntity<>(params, headers);

        System.out.println("네이버 토큰 요청 URI: " + tokenUri);
        System.out.println("네이버 토큰 요청 파라미터: " + naverTokenRequest.getBody());

        // 5. POST 방식으로 네이버 토큰 발급 URI에 요청 보내기
        // (응답은 NaverTokenResponse DTO 객체로 자동 매핑됩니다)
        ResponseEntity<NaverTokenResponse> response = restTemplate.postForEntity(
                tokenUri,
                naverTokenRequest,
                NaverTokenResponse.class
        );

        // 6. 응답 처리
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            String accessToken = response.getBody().getAccess_token();
            System.out.println("네이버 Access Token 발급 성공: " + accessToken);
            return accessToken;
        } else {
            // 예외 상황 처리 (실제로는 구체적인 예외를 던지는 것이 좋습니다)
            System.err.println("네이버 토큰 발급 실패: " + response);
            throw new RuntimeException("네이버 Access Token 발급에 실패했습니다.");
        }
    }

    @Data // Lombok (Getter, Setter, toString 등 자동 생성)
    @JsonIgnoreProperties(ignoreUnknown = true) // 응답 JSON에 모르는 필드가 있어도 무시
    private static class NaverTokenResponse {
        private String access_token;
        private String refresh_token;
        private String token_type;
        private int expires_in;
        // (error, error_description 필드도 추가할 수 있음)
    }

    @GetMapping("/id/{userId}")
    public ResponseEntity<UserAccount> getUserById(@PathVariable Long userId) {
        UserAccount user = userAccountService.userSelectOne(userId);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 회원가입
    @PostMapping
    public ResponseEntity<?> registerUser(@RequestBody UserAccount vo) {
        try {
            // 비밀번호 암호화
            vo.setPassword(passwordEncoder.encode(vo.getPassword()));
            userAccountService.userInsert(vo);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("success", true, "message", "회원 등록 완료"));
        } catch (DuplicateKeyException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", "이미 등록된 정보입니다"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "서버 오류 발생"));
        }
    }

    // 아이디 중복 체크
    @GetMapping("/check-id")
    public Map<String, Object> checkLoginId(@RequestParam String loginId) {
        boolean available = userAccountService.isLoginIdAvailable(loginId);
        return Map.of("available", available);
    }

    // 로그인 기능 + 토큰 발급
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String loginId = loginRequest.get("login_id");
        String password = loginRequest.get("password");

        UserAccount user = userAccountService.selectUserByLoginId(loginId);

        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            // JWT 생성 (payload: loginId, userId)
            String token = jwtUtil.generateToken(user.getLoginId(), user.getUserId());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "token", token,
                    "message", "로그인 성공"
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "아이디 또는 비밀번호가 일치하지 않습니다."));
        }
    }

    // 마이페이지
    @GetMapping("/mypage")
    public ResponseEntity<?> getMyPage() {
        // 💡 SecurityContextHolder에서 인증된 객체 가져오기
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserAccount) {
            UserAccount user = (UserAccount) principal;
            // 💡 비밀번호 필드를 제외하고 사용자 정보를 반환하는 DTO를 사용하는 것이 더 안전합니다.
            return ResponseEntity.ok(user);
        } else {
            // 인증 필터 (JwtFilter)가 실패하면 여기까지 오지 않겠지만, 안전 장치
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "인증된 사용자 정보를 찾을 수 없습니다."));
        }
    }

    // 수정
    @PutMapping("/{userId}")
    public ResponseEntity<String> updateUser(@PathVariable Long userId, @RequestBody UserAccount vo) {
        vo.setUserId(userId);
        int rowsAffected = userAccountService.userUpdate(vo);
        if (rowsAffected > 0) {
            return ResponseEntity.ok("User updated successfully.");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 삭제
    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable Long userId) {
        int rowsAffected = userAccountService.userDelete(userId);
        if (rowsAffected > 0) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 아이디 찾기
    @PostMapping("/find-id")
    public ResponseEntity<?> findId(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String phone = request.get("phone");
        String loginId = userAccountService.findLoginIdByNameAndPhone(name, phone);
        if (loginId != null) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "loginId", loginId, // 찾은 아이디 반환
                    "message", "아이디를 찾았습니다."
            ));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "일치하는 사용자 정보가 없습니다."));
        }
    }

    // 비밀번호 재설정
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String loginId = request.get("login_id");
        String name = request.get("name");
        String phone = request.get("phone");
        String newPassword = request.get("new_password");
        // 새로운 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(newPassword);
        // 변경된 비밀번호 업데이트
        int rowsAffected = userAccountService.resetPassword(loginId, name, phone, encodedPassword);
        if (rowsAffected > 0) {
            return ResponseEntity.ok(Map.of("success", true, "message", "비밀번호가 성공적으로 변경되었습니다."));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "사용자 정보가 일치하지 않습니다."));
        }
    }
}