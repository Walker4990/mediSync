package com.mediSync.project.config;

import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
public class OAuth2Attribute {
    private Map<String, Object> attributes; // 원본 속성
    private String attributeKey; // 고유 ID 키 (예: "id")
    private String loginId; // 우리가 만들 loginId (예: "kakao_123456")
    private String name;    // 이름 (예: "홍길동")
    private String email;   // 이메일 (선택)

    @Builder
    public OAuth2Attribute(Map<String, Object> attributes, String attributeKey, String loginId, String name, String email) {
        this.attributes = attributes;
        this.attributeKey = attributeKey;
        this.loginId = loginId;
        this.name = name;
        this.email = email;
    }

    // 공급자(kakao, naver)별로 파싱
    public static OAuth2Attribute of(String provider, String attributeKey, Map<String, Object> attributes) {
        switch (provider) {
            case "kakao":
                return ofKakao(provider, "id", attributes);
            case "naver":
                return ofNaver(provider, "id", attributes);
            default:
                throw new RuntimeException("지원하지 않는 소셜 로그인입니다.");
        }
    }

    // 카카오 파싱
    private static OAuth2Attribute ofKakao(String provider, String attributeKey, Map<String, Object> attributes) {
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");

        String uniqueId = attributes.get(attributeKey).toString();

        return OAuth2Attribute.builder()
                .loginId(provider + "_" + uniqueId) // "kakao_12345678"
                .name((String) profile.get("nickname"))
                .email((String) kakaoAccount.get("email")) // (동의 항목에 따라 null일 수 있음)
                .attributes(attributes)
                .attributeKey(attributeKey)
                .build();
    }

    // 네이버 파싱 (네이버는 "response" 객체 안에 정보가 있음)
    private static OAuth2Attribute ofNaver(String provider, String attributeKey, Map<String, Object> attributes) {
        Map<String, Object> response = (Map<String, Object>) attributes.get("response");

        String uniqueId = (String) response.get(attributeKey);

        return OAuth2Attribute.builder()
                .loginId(provider + "_" + uniqueId) // "naver_asdf1234"
                .name((String) response.get("name"))
                .email((String) response.get("email"))
                .attributes(response) // "response" 맵을 속성으로 저장
                .attributeKey(attributeKey)
                .build();
    }
}