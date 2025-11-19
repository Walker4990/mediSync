package com.mediSync.project.medical.controller;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.mediSync.project.common.service.EmailService;
import com.mediSync.project.config.JwtUtil;
import com.mediSync.project.medical.service.UserAccountService;
import com.mediSync.project.medical.vo.AdminAccount;
import com.mediSync.project.medical.vo.UserAccount;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.*;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserAccountController {

    private final UserAccountService userAccountService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Autowired
    private JwtUtil jwtUtil;

    // application.properties에서 설정값 주입
    @Value("${spring.security.oauth2.client.registration.naver.client-id}")
    private String naverClientId;
    @Value("${spring.security.oauth2.client.registration.naver.client-secret}")
    private String naverClientSecret;
    @Value("${spring.security.oauth2.client.provider.naver.token-uri}")
    private String naverTokenUri;
    @Value("${spring.security.oauth2.client.provider.naver.user-info-uri}")
    private String naverUserInfoUri;

    @Value("${spring.security.oauth2.client.registration.kakao.client-id}")
    private String kakaoClientId;
    @Value("${spring.security.oauth2.client.registration.kakao.client-secret}")
    private String kakaoClientSecret;
    @Value("${spring.security.oauth2.client.provider.kakao.token-uri}")
    private String kakaoTokenUri;
    @Value("${spring.security.oauth2.client.provider.kakao.user-info-uri}")
    private String kakaoUserInfoUri;
    @Value("${spring.security.oauth2.client.registration.kakao.redirect-uri}")
    private String kakaoRedirectUri;

    // 전체 리스트
    @GetMapping
    public List<UserAccount> getAllUsers() {
        return userAccountService.userSelectAll();
    }

    // naver 로그인 테스트
    @GetMapping("/naver/callback")
    public ResponseEntity<?> handleNaverCallback(@RequestParam String code, @RequestParam String state) {
        // 1. 네이버 Access Token 발급
        String accessToken;
        try {
            accessToken = getNaverAccessTokenTest(code, state);
        } catch (RuntimeException e) {
            // 토큰 발급 실패 시 클라이언트의 에러 페이지로 리다이렉트 (또는 에러 메시지 반환)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "네이버 토큰 발급 실패"));
        }

        // 2. 네이버 사용자 프로필 조회
        NaverUserProfile naverProfile = getNaverUserProfile(accessToken);
        NaverUser naverUser = naverProfile.getResponse();

        // 네이버 고유 ID를 우리 서비스의 login_id로 사용할 소셜 ID 생성
        String socialLoginId = "NAVER_" + naverUser.getId();

        // 3. 서비스 로그인/회원가입 처리
        UserAccount user = userAccountService.selectUserByLoginId(socialLoginId);

        // 3-1. 신규 사용자인 경우 회원가입 처리
        if (user == null) {
            // 소셜 회원가입 로직
            UserAccount newUser = new UserAccount();
            newUser.setLoginId(socialLoginId);
            newUser.setPassword(passwordEncoder.encode(socialLoginId)); // 소셜 사용자는 임시/랜덤 비밀번호 저장
            newUser.setName(naverUser.getName());
            newUser.setEmail(naverUser.getEmail());
            newUser.setPhone("000-0000-0000"); // 필수 필드이므로 임시값 또는 추가 입력 필요
            newUser.setSocial("NAVER"); // 소셜 로그인 사용자임을 표시

            try {
                userAccountService.userInsert(newUser);
                user = newUser; // 새로 가입된 사용자 객체 사용
            } catch (DuplicateKeyException e) {
                // 이메일 등이 중복될 수 있으나, 여기서는 ID 기반이므로 무시하거나 로그 남김
            }
        }

        // 4. JWT 토큰 발급
        String jwtToken = jwtUtil.generateToken(user.getLoginId(), user.getUserId());

        // 5. 클라이언트(React)로 리다이렉트 및 토큰 전달
        // **프론트엔드에서 토큰을 처리할 경로**를 설정해야 합니다. (예: /oauth/redirect)
        // 이 리다이렉트는 브라우저를 클라이언트로 이동시키고, URL 파라미터를 통해 토큰을 전달합니다.
        String frontendRedirectUrl = "http://localhost:3000/oauth/redirect?token=" + jwtToken + "&login=success";

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(frontendRedirectUrl));

        // HTTP 302 Found 응답으로 클라이언트 브라우저를 리다이렉트
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
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
        params.add("client_id", naverClientId);
        params.add("client_secret", naverClientSecret);
        params.add("code", code);
        params.add("state", state);
        // (참고: 네이버의 경우 redirect_uri는 토큰 요청 시 필수는 아님)

        // 4. 헤더와 바디를 하나의 HttpEntity 객체로 합치기
        HttpEntity<MultiValueMap<String, String>> naverTokenRequest =
                new HttpEntity<>(params, headers);

        System.out.println("네이버 토큰 요청 URI: " + naverTokenUri);
        System.out.println("네이버 토큰 요청 파라미터: " + naverTokenRequest.getBody());

        // 5. POST 방식으로 네이버 토큰 발급 URI에 요청 보내기
        // (응답은 NaverTokenResponse DTO 객체로 자동 매핑됩니다)
        ResponseEntity<NaverTokenResponse> response = restTemplate.postForEntity(
                naverTokenUri,
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

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class NaverUser {
        private String id;       // 네이버 고유 식별자
        private String email;    // 이메일
        private String name;     // 이름
        // (필요에 따라 nickname, profile_image 등 scope에 맞게 추가)
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class NaverUserProfile {
        private String resultcode;
        private String message;
        private NaverUser response; // **핵심: 사용자 정보는 'response' 객체 안에 중첩되어 있음**
    }

    public NaverUserProfile getNaverUserProfile(String accessToken) {

        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getMessageConverters()
                .add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));

        // 2. HTTP 요청 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        // ** (필수) Authorization 헤더에 Bearer 토큰 설정 **
        headers.set("Authorization", "Bearer " + accessToken);

        // 3. 헤더를 담은 HttpEntity 객체 생성 (GET 요청이므로 바디는 없음)
        HttpEntity<String> entity = new HttpEntity<>(headers);

        System.out.println("네이버 사용자 프로필 요청 URI: " + naverUserInfoUri);

        // 4. GET 방식으로 네이버 프로필 API에 요청 보내기
        // (응답은 NaverUserProfile DTO 객체로 자동 매핑됩니다)
        ResponseEntity<NaverUserProfile> response = restTemplate.exchange(
                naverUserInfoUri,
                HttpMethod.GET,
                entity,
                NaverUserProfile.class
        );

        // 5. 응답 처리
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            System.out.println("네이버 사용자 프로필 조회 성공: " + response.getBody());
            return response.getBody();
        } else {
            System.err.println("네이버 사용자 프로필 조회 실패: " + response);
            throw new RuntimeException("네이버 사용자 프로필 조회에 실패했습니다.");
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
        // token
    }

    @GetMapping("/kakao/callback")
    public ResponseEntity<?> handleKakaoCallback(@RequestParam String code, @RequestParam String state) {

        // 1. 카카오 Access Token 발급
        String accessToken;
        try {
            accessToken = getKakaoAccessToken(code, state);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "카카오 토큰 발급 실패: " + e.getMessage()));
        }

        // 2. 카카오 사용자 프로필 조회
        KakaoUserProfile kakaoProfile = getKakaoUserProfile(accessToken);

        // 💡 카카오 고유 ID
        String socialLoginId = "KAKAO_" + kakaoProfile.getId();

        // 3. 서비스 로그인/회원가입 처리
        UserAccount user = userAccountService.selectUserByLoginId(socialLoginId);

        if (user == null) {
            // 소셜 회원가입 로직
            UserAccount newUser = new UserAccount();
            newUser.setLoginId(socialLoginId);
            newUser.setPassword(passwordEncoder.encode(socialLoginId)); // 소셜 사용자는 임시/랜덤 비밀번호 저장
            newUser.setName(kakaoProfile.getKakaoAccount().getProfile().getNickname());
            newUser.setEmail(kakaoProfile.getKakaoAccount().getEmail());
            newUser.setPhone("000-0000-0000"); // 필수 필드이므로 임시값 또는 추가 입력 필요
            newUser.setSocial("KAKAO"); // 소셜 로그인 사용자임을 표시

            try {
                userAccountService.userInsert(newUser);
                user = newUser; // 새로 가입된 사용자 객체 사용
            } catch (DuplicateKeyException e) {
                // 이메일 등이 중복될 수 있으나, 여기서는 ID 기반이므로 무시하거나 로그 남김
            }
        }

        // 4. JWT 토큰 발급
        String jwtToken = jwtUtil.generateToken(user.getLoginId(), user.getUserId());

        // 5. 클라이언트(React)로 리다이렉트 및 토큰 전달
        // **프론트엔드에서 토큰을 처리할 경로**를 설정해야 합니다. (예: /oauth/redirect)
        // 이 리다이렉트는 브라우저를 클라이언트로 이동시키고, URL 파라미터를 통해 토큰을 전달합니다.
        String frontendRedirectUrl = "http://localhost:3000/oauth/redirect?token=" + jwtToken + "&login=success";

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(frontendRedirectUrl));

        // HTTP 302 Found 응답으로 클라이언트 브라우저를 리다이렉트
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    public String getKakaoAccessToken(String code, String state) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.add("Accept", "application/json");

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", kakaoClientId);
        params.add("client_secret", kakaoClientSecret);
        params.add("code", code);
        params.add("redirect_uri", kakaoRedirectUri);

        HttpEntity<MultiValueMap<String, String>> kakaoTokenRequest = new HttpEntity<>(params, headers);

        ResponseEntity<KakaoTokenResponse> response = restTemplate.postForEntity(
                kakaoTokenUri,
                kakaoTokenRequest,
                KakaoTokenResponse.class
        );

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            return response.getBody().getAccess_token();
        } else {
            throw new RuntimeException("카카오 Access Token 발급에 실패했습니다.");
        }
    }

    public KakaoUserProfile getKakaoUserProfile(String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getMessageConverters()
                .add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        // 💡 카카오 프로필 요청 시 ContentType은 FormUrlEncoded가 표준입니다.
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // 💡 카카오는 이메일, 프로필 등 특정 정보 조회를 요청해야 함
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("property_keys", "[\"kakao_account.email\", \"kakao_account.profile\"]");

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);

        ResponseEntity<KakaoUserProfile> response = restTemplate.exchange(
                kakaoUserInfoUri,
                HttpMethod.POST, // 💡 카카오는 POST 방식 사용
                entity,
                KakaoUserProfile.class
        );

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            return response.getBody();
        } else {
            throw new RuntimeException("카카오 사용자 프로필 조회에 실패했습니다.");
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class KakaoTokenResponse {
        private String access_token;
        private String refresh_token;
        private String token_type;
        private int expires_in;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class KakaoUserProfile {
        private Long id; // 💡 카카오 고유 ID
        @JsonProperty("kakao_account")
        private KakaoAccount kakaoAccount; // 💡 이메일, 프로필 정보가 담긴 객체
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class KakaoAccount {
        private String email;
        private Profile profile; // 💡 닉네임(이름)이 담긴 객체
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Profile {
        private String nickname; // 💡 우리가 'name'으로 사용할 필드
    }

    // 조회
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
    public ResponseEntity<?> userLogin(@RequestBody Map<String, String> loginRequest) {
        String loginId = loginRequest.get("login_id");
        String password = loginRequest.get("password");

        UserAccount user = userAccountService.selectUserByLoginId(loginId);

        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            String token = jwtUtil.generateToken(user.getLoginId(), user.getUserId());
//            String token = jwtUtil.generateToken(
//                    user.getLoginId(),  // 1. Subject (loginId)
//                    user.getUserId(),   // 2. id (userId)
//                    "USER"              // 3. Role ("USER")
//            );

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
    @PatchMapping("/{userId}/edit")
    public ResponseEntity<String> updateUser(@PathVariable Long userId, @RequestBody UserAccount vo) {
        vo.setUserId(userId);
        UserAccount currentUser = userAccountService.userSelectOne(userId);
        int rowsAffected = userAccountService.userUpdate(vo);
        if (rowsAffected > 0) {
            return ResponseEntity.ok("User updated successfully.");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 비밀번호 변경 따로 분리
    @PatchMapping("/{userId}/pass")
    public ResponseEntity<String> updateUserPass(@PathVariable Long userId, @RequestBody UserAccount vo) {
        vo.setUserId(userId);
        UserAccount currentUser = userAccountService.userSelectOne(userId);
        if (currentUser == null) {
            return ResponseEntity.notFound().build();
        }
        // 현재 비밀번호와 일치할 경우
        if (passwordEncoder.matches(vo.getCurrentPassword(), currentUser.getPassword())) {
            String encodedNewPassword = passwordEncoder.encode(vo.getPassword());
            vo.setPassword(encodedNewPassword); // vo 객체에 암호화된 새 비밀번호를 덮어씁니다.

            int rowsAffected = userAccountService.userUpdate(vo);

            if (rowsAffected > 0) {
                return ResponseEntity.ok("User updated successfully.");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Update failed after password check.");
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("현재 비밀번호가 일치하지 않습니다.");
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

    // 비밀번호 분실 시 임시 재발급
    @PostMapping("/temp-password")
    public ResponseEntity<Map<String, Object>> sendTempPassword(@RequestBody Map<String, String> request) {
        String loginId = request.get("loginId");
        String name = request.get("name");
        String phone = request.get("phone");

        try {
            UserAccount user = userAccountService.findUserForSendEmail(loginId, name, phone);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "일치하는 사용자 정보가 없습니다."));
            }

            String userEmail = user.getEmail();
            String tempPassword = emailService.sendTempPasswordEmail(userEmail);
            userAccountService.resetPassword(user.getLoginId(), passwordEncoder.encode(tempPassword));

            return ResponseEntity.ok(Map.of("success", true, "message", "가입 시 등록한 이메일로 임시 비밀번호를 발송했습니다."));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "처리 중 오류가 발생했습니다."));
        }

    }

    // JWT 기반 로그아웃 처리
    @PostMapping("/logout")
    public ResponseEntity<?> userLogout() {
        // 1. 서버 세션 정리 (SessionCreationPolicy.STATELESS이므로 대부분 불필요)
        // 2. JWT 블랙리스트 처리 (필요하다면 여기에 Redis 등을 이용해 무효화 로직 추가)
        // 클라이언트에서 토큰을 삭제하는 것이 주요 목적이므로,
        // 서버는 단순하게 200 OK를 반환하여 요청이 성공했음을 알립니다.
        return ResponseEntity.ok(Map.of("success", true, "message", "로그아웃 요청 처리 완료"));
    }
}