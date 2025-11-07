package com.mediSync.project.config;

import com.mediSync.project.config.JwtUtil;
import com.mediSync.project.medical.vo.UserAccount;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    // 사용자님의 기존 JwtUtil 주입
    private final JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        // CustomOAuth2UserService에서 반환한 PrincipalDetails
        PrincipalDetails principalDetails = (PrincipalDetails) authentication.getPrincipal();
        // 래핑된 UserAccount 객체 가져오기
        UserAccount user = principalDetails.getUser();
        // 사용자 JwtUtil로 토큰 생성
        String token = jwtUtil.generateToken(user.getLoginId(), user.getUserId());
        // 프론트엔드 콜백 주소로 토큰과 함께 리다이렉트
        String targetUrl = "http://localhost:3000/auth/callback?token=" + token;

        response.sendRedirect(targetUrl);
    }
}