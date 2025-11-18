package com.mediSync.project.config;

import java.io.IOException;
import java.util.ArrayList;

import com.mediSync.project.medical.mapper.AdminAccountMapper;
import com.mediSync.project.medical.service.AdminAccountService;
import com.mediSync.project.medical.service.UserAccountService;
import com.mediSync.project.medical.vo.AdminAccount;
import com.mediSync.project.medical.vo.UserAccount;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserAccountService userAccountService;
    @Autowired
    private AdminAccountMapper adminAccountMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // ❗️ 1. 디버깅: 모든 API 요청 경로 확인
        System.out.println("\n[JwtFilter] 요청 감지: " + request.getRequestURI());

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            // ❗️ 2. 디버깅: 토큰 수신 확인
            System.out.println("[JwtFilter] 토큰이 감지되었습니다. 유효성 검증 시도...");

            if (jwtUtil.validateToken(token)) {

                String idFromToken = jwtUtil.extractLoginId(token);

                // ❗️ 3. 디버깅: 토큰에서 추출된 ID 확인
                System.out.println("[JwtFilter] 토큰에서 추출된 ID (loginId 클레임): " + idFromToken);

                // 4. UserAccount 테이블에서 먼저 조회합니다.
                UserAccount user = userAccountService.selectUserByLoginId(idFromToken);

                if (user != null) {
                    System.out.println("[JwtFilter] ✨ USER 인증 성공: " + user.getLoginId());
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            user, null, new ArrayList<>());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else {
                    // ❗️ 5. 디버깅: User가 아닐 경우 Admin 조회를 시도하는지 확인
                    System.out.println("[JwtFilter] USER 테이블 조회 실패. ADMIN 테이블 조회를 시도합니다.");

                    // ❗️ 6. 디버깅: AdminAccountService가 주입되었는지 확인 (가장 중요)
                    if (adminAccountMapper == null) {
                        System.err.println("[JwtFilter] ❌ 치명적 오류: AdminAccountService가 null입니다. (Spring Bean 주입 실패)");
                    } else {
                        AdminAccount admin = adminAccountMapper.loginAdmin(idFromToken);

                        if (admin != null) {
                            // ❗️ 7. 디버깅: Admin 인증 성공 확인
                            System.out.println("[JwtFilter] ✨ ADMIN 인증 성공: " + admin.getEmpId());
                            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                    admin, null, new ArrayList<>());
                            SecurityContextHolder.getContext().setAuthentication(auth);
                        } else {
                            // ❗️ 8. 디버깅: Admin 조회도 실패
                            System.err.println("[JwtFilter] ❌ 인증 실패: ADMIN 테이블에서도 ID를 찾을 수 없습니다: " + idFromToken);
                        }
                    }
                }
            } else {
                System.err.println("[JwtFilter] ❌ 토큰 유효성 검증 실패 (만료 또는 서명 오류)");
            }
        }

        chain.doFilter(request, response);
    }
}