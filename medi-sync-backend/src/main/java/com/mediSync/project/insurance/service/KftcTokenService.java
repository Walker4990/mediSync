package com.mediSync.project.insurance.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class KftcTokenService {

    // ✅ WebClient는 매번 새로 만드는 대신 재사용 (baseUrl 포함)
    private final WebClient webClient;

    @Value("${kftc.base-url}") private String baseUrl;
    @Value("${kftc.client-id}") private String clientId;
    @Value("${kftc.client-secret}") private String clientSecret; // ✅ 닫는 중괄호 수정

    private String cachedToken;
    private long expiryEpochMs = 0;

    // ✅ 생성자에서 WebClient 초기화
    public KftcTokenService(
            @Value("${kftc.base-url}") String baseUrl
    ) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
                .build();
    }

    public synchronized String getAccessToken() {
        long now = System.currentTimeMillis();

        // ✅ 캐시 토큰이 만료 전이면 재사용
        if (cachedToken != null && now < (expiryEpochMs - 60_000)) return cachedToken;

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "client_credentials");
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("scope", "oob");
        form.add("client_use_code", "M202502782");

        try {
            Map<String, Object> res = webClient.post()
                    .uri("/oauth/2.0/token")
                    .body(BodyInserters.fromFormData(form))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (res == null || !res.containsKey("access_token")) {
                throw new RuntimeException("KFTC access_token 응답이 비어있음: " + res);
            }

            cachedToken = (String) res.get("access_token");
            int expiresIn = ((Number) res.getOrDefault("expires_in", 3600)).intValue();
            expiryEpochMs = now + expiresIn * 1000L;

            System.out.println("✅ [KFTC] Access Token 발급 성공: " + cachedToken);
            return cachedToken;

        } catch (Exception e) {
            System.err.println("❌ [KFTC] 토큰 요청 실패: " + e.getMessage());
            throw new RuntimeException("KFTC Token 발급 실패", e);
        }
    }
}
