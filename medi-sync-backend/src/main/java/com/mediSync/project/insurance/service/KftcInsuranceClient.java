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
    // 가상의 데이터 - kftc랑 연결하고 싶은데 사업자가 있어야 연결 가능
    public List<Map<String, Object>> fetchMockInsurance() {
        List<Map<String, Object>> insuranceList = List.of(
                Map.of(
                        "insu_num", "S20231122001",
                        "prod_name", "삼성화재 실손의료보험",
                        "insu_type", "03",
                        "insu_status", "02",
                        "issue_date", "20231122",
                        "exp_date", "20331122",
                        "insurer_code", "INS002"
                ),
                Map.of(
                        "insu_num", "H20220515012",
                        "prod_name", "현대해상 암보험",
                        "insu_type", "01",
                        "insu_status", "02",
                        "issue_date", "20220515",
                        "exp_date", "20320515",
                        "insurer_code", "INS003"
                ),
                Map.of(
                        "insu_num", "D20200105007",
                        "prod_name", "DB손해보험 운전자보험",
                        "insu_type", "02",
                        "insu_status", "05",
                        "issue_date", "20200105",
                        "exp_date", "20250105",
                        "insurer_code", "INS004"
                ),
                Map.of(
                        "insu_num", "H20190304033",
                        "prod_name", "한화생명 종신보험",
                        "insu_type", "04",
                        "insu_status", "02",
                        "issue_date", "20190304",
                        "exp_date", "20490304",
                        "insurer_code", "INS005"
                )
        );

        System.out.println("📋 Mock 보험가입 내역:");
        insuranceList.forEach(System.out::println);

        return insuranceList;
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
