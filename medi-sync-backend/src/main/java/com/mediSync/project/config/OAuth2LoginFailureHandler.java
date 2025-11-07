package com.mediSync.project.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {

        String errorMessage = "소셜 로그인에 실패했습니다: " + exception.getMessage();

        // 프론트엔드 콜백 주소로 에러 메시지 전달
        String targetUrl = "http://localhost:3000/auth/callback?error=" +
                URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);

        response.sendRedirect(targetUrl);
    }
}