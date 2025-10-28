package com.mediSync.project.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
// import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import com.mediSync.project.service.CustomOAuth2UserService;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    // 소셜 로그인 후 사용자 정보를 처리할 서비스 (필수 주입)
    private final CustomOAuth2UserService customOAuth2UserService;

    // 비밀번호 암호화
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 주요 보안 필터체인 세팅
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // 1. URL 기반 인가(Authorization) 설정
        http.authorizeHttpRequests(auth -> auth
                // static 파일 및 로그인/회원가입 관련 페이지는 누구나 접근 가능
                // .requestMatchers(
//                        AntPathRequestMatcher.antMatcher("/css/**"),
//                        AntPathRequestMatcher.antMatcher("/js/**"),
//                        AntPathRequestMatcher.antMatcher("/images/**"),
//                        AntPathRequestMatcher.antMatcher("/login"),       // 일반 로그인 페이지
//                        AntPathRequestMatcher.antMatcher("/register"),    // 회원가입 페이지
//                ).permitAll()

                // USER 권한이 필요한 사용자 페이지 (예: 환자 본인 정보, 예약)
                // .requestMatchers(AntPathRequestMatcher.antMatcher("/user/**")).hasRole("USER")

                // ADMIN 권한이 필요한 ERP/관리자 페이지
                // .requestMatchers(AntPathRequestMatcher.antMatcher("/admin/**")).hasRole("ADMIN")

                // 나머지 모든 요청 허용
                .anyRequest().permitAll()
        );

        // 2. 폼 기반 로그인 설정 (일반 로그인 경로)
//        http.formLogin(form -> form
//                .loginPage("/login")         // 사용자 정의 로그인 페이지 경로
//                .usernameParameter("loginId") // 로그인 시 사용할 ID 파라미터명
//                .passwordParameter("password") // 로그인 시 사용할 PW 파라미터명
//                .defaultSuccessUrl("/main", true) // 로그인 성공 시 이동할 기본 페이지
//                .failureUrl("/login?error")     // 로그인 실패 시 이동할 페이지
//                .permitAll()
//        );

        // 3. OAuth 2.0 소셜 로그인 설정 (네이버/카카오)
        http.oauth2Login(oauth -> oauth
                // OAuth2 인증 성공 후 사용자 정보 처리를 위한 Custom Service 지정
                .userInfoEndpoint(userInfo -> userInfo
                        .userService(customOAuth2UserService)
                )
                .defaultSuccessUrl("/main", true) // 소셜 로그인 성공 시 이동 경로
                .failureUrl("/login?oauth_error")
        );

        // 4. 로그아웃 설정
//        http.logout(logout -> logout
//                .logoutRequestMatcher(new AntPathRequestMatcher("/logout")) // 로그아웃 요청 경로
//                .logoutSuccessUrl("/login") // 로그아웃 성공 시 이동 경로
//                .invalidateHttpSession(true) // 세션 무효화
//                .deleteCookies("JSESSIONID") // 쿠키 삭제
//        );

        // 5. CSRF (Cross-Site Request Forgery) 설정
        // API 서버가 아니라면 기본적으로 CSRF를 활성화하는 것이 안전합니다.
        // 개발/테스트 목적으로 잠시 비활성화할 수 있지만, 운영 시에는 주의가 필요합니다.
        // http.csrf(csrf -> csrf.disable());

        // 6. 기타 설정 (H2 Console 사용 시)
        // http.headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));


        return http.build();
    }
}