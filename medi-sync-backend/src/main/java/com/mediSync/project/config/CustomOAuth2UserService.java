package com.mediSync.project.config;

import com.mediSync.project.medical.service.UserAccountService;
import com.mediSync.project.medical.vo.UserAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder; // (비밀번호 암호화기 주입)
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserAccountService userAccountService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        // 기본 OAuth2 유저 정보 가져오기
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // 공급자 (kakao, naver...)
        String provider = userRequest.getClientRegistration().getRegistrationId();

        // 고유 ID 키 (kakao="id", naver="id")
        String attributeKey = userRequest.getClientRegistration().getProviderDetails()
                .getUserInfoEndpoint().getUserNameAttributeName();

        // 공급자별 정보 파싱
        OAuth2Attribute attributes = OAuth2Attribute.of(provider, attributeKey, oAuth2User.getAttributes());

        // userAccountService로 DB 조회
        UserAccount user = userAccountService.selectUserByLoginId(attributes.getLoginId());

        if (user == null) {
            // DB에 없으면 자동 회원가입
            user = registerNewUser(attributes, provider);
        }

        // PrincipalDetails 객체로 래핑하여 반환
        return new PrincipalDetails(user, oAuth2User.getAttributes());
    }

    // 자동 회원가입 로직
    private UserAccount registerNewUser(OAuth2Attribute attributes, String provider) {
        UserAccount newUser = new UserAccount();
        newUser.setLoginId(attributes.getLoginId()); // "kakao_123456"

        // 소셜 로그인은 비밀번호가 없으므로, 임의의 값 암호화
        String dummyPassword = passwordEncoder.encode(UUID.randomUUID().toString());
        newUser.setPassword(dummyPassword);

        newUser.setName(attributes.getName()); // "홍길동"

        // UserAccount VO에 provider 필드 추가 고려
            // newUser.setProvider(provider);
        // UserAccount VO에 email 필드 추가 고려
            // newUser.setEmail(attributes.getEmail());

        userAccountService.userInsert(newUser); // (DB에 INSERT)

        return userAccountService.selectUserByLoginId(attributes.getLoginId()); // (방금 가입한 유저 다시 조회)
    }
}