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
    public Map<String, Object> submitClaim(Long claimId, String insurerCode, Object insPay) {
        String token = tokenService.getAccessToken();

        // 지금은 KFTC 실제 청구 API가 막혀있으니까 mock으로 응답
        System.out.println("📤 [MOCK] 보험사 청구 전송");
        System.out.println("    ➤ claimId: " + claimId);
        System.out.println("    ➤ insurerCode: " + insurerCode);
        System.out.println("    ➤ amount: " + insPay);

        // 실제로는 아래 코드처럼 호출하게 됨:
    /*
    Map<String, Object> body = webClient.post()
        .uri(baseUrl + "/v2.0/insurance/claim")
        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
        .bodyValue(Map.of(
            "insurer_code", insurerCode,
            "claim_amount", insPay,
            "bank_tran_id", "M" + System.currentTimeMillis(), // 거래고유번호
            "user_seq_no", "U123456789"
        ))
        .retrieve()
        .bodyToMono(Map.class)
        .block();
    */

        // 지금은 단순히 모의 성공 응답 반환
        return Map.of(
                "resultCode", "SUCCESS",
                "paidAmount", insPay,
                "message", "보험금 모의 승인 처리 완료"
        );
    }


}
