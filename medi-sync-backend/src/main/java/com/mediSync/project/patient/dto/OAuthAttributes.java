package com.mediSync.project.dto;

// import com.mediSync.project.dto.AccountDTO.Role;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;

/**
 * 소셜 서비스(네이버, 카카오 등)별로 받아오는
 * 사용자 정보의 형태가 다르므로, 이를 표준화하여 처리하기 위한 DTO
 */
@Getter
@Builder
public class OAuthAttributes {
    private Map<String, Object> attributes; // 원본 사용자 정보
    private String nameAttributeKey;        // attributes에서 사용자 이름에 해당하는 키
    private String name;
    private String email;
    private String provider;                // "naver", "kakao" 등
    private String providerId;              // provider + provider의 고유 ID

    /**
     * registrationId(서비스 구분 코드)에 따라 적절한 파싱 메서드를 호출
     */
    public static OAuthAttributes of(String registrationId, String userNameAttributeName, Map<String, Object> attributes) {
        if ("naver".equals(registrationId)) {
            return ofNaver("response", attributes);
        }
        if ("kakao".equals(registrationId)) {
            return ofKakao("id", attributes);
        }
        // 추후 Google 등 다른 서비스 추가 가능
        // return ofGoogle(userNameAttributeName, attributes);

        // 지원하지 않는 서비스인 경우 예외 처리 (혹은 기본 로직)
        throw new IllegalArgumentException("Unsupported OAuth2 provider: " + registrationId);
    }

    /**
     * 카카오 응답 파싱
     * 카카오는 id가 최상위에 있고, email/nickname 등은 kakao_account 객체 내부에 있습니다.
     */
    private static OAuthAttributes ofKakao(String userNameAttributeName, Map<String, Object> attributes) {
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");

        String providerId = attributes.get(userNameAttributeName).toString(); // "id"
        String name = (String) profile.get("nickname");
        String email = (String) kakaoAccount.get("email");

        return OAuthAttributes.builder()
                .name(name)
                .email(email)
                .provider("kakao")
                .providerId(providerId)
                .attributes(attributes)
                .nameAttributeKey(userNameAttributeName)
                .build();
    }

    /**
     * 네이버 응답 파싱
     * 네이버는 응답(response) 객체 내부에 모든 정보가 포함되어 있습니다.
     */
    private static OAuthAttributes ofNaver(String userNameAttributeName, Map<String, Object> attributes) {
        Map<String, Object> response = (Map<String, Object>) attributes.get(userNameAttributeName); // "response"

        String providerId = (String) response.get("id"); // 네이버 고유 ID
        String name = (String) response.get("name");
        String email = (String) response.get("email");

        return OAuthAttributes.builder()
                .name(name)
                .email(email)
                .provider("naver")
                .providerId(providerId)
                .attributes(attributes)
                .nameAttributeKey(userNameAttributeName)
                .build();
    }
}
