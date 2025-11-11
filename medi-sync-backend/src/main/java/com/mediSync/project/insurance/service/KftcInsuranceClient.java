package com.mediSync.project.insurance.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class KftcInsuranceClient {
    private final WebClient webClient = WebClient.builder().build();
    private final KftcTokenService tokenService;

    @Value("${kftc.base-url}") private String baseUrl;

    public List<Map<String, Object>> fetchInsurer() {
        String token = tokenService.getAccessToken();

        Map<String, Object> body = webClient.get()
                .uri(baseUrl + "/v2.0/insurances") // ✅ '/list' 제거
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        System.out.println("📦 [KFTC Response Raw] " + body);

        if (body == null || !"A0000".equals(body.get("rsp_code"))) {
            throw new RuntimeException("❌ [KFTC] 보험사 목록 요청 실패: " + body);
        }

        // ✅ 'res_list' 필드에서 목록 추출
        return (List<Map<String, Object>>) body.getOrDefault("res_list", List.of());
    }


}
