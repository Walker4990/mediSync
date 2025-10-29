package com.mediSync.project.service;

import com.mediSync.project.dto.AccountDTO;
import com.mediSync.project.dto.OAuthAttributes; // 소셜 서비스별 정보를 정규화할 DTO
import com.mediSync.project.mapper.AccountMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.UUID;

/**
 * 소셜 로그인(OAuth 2.0) 성공 후 사용자 정보를 처리하는 서비스
 *
 * 1. DefaultOAuth2UserService를 상속받아 loadUser 메서드를 오버라이드합니다.
 * 2. 네이버, 카카오 등으로부터 사용자 정보를 받아옵니다.
 * 3. 해당 정보를 기반으로 USER_ACCOUNT 테이블에 회원이 존재하는지 확인합니다.
 * 4. 회원이 없으면, DTO를 생성하여 회원가입(DB 저장)을 수행합니다.
 * 5. 회원이 있으면, 정보를 업데이트합니다.
 * 6. Spring Security가 관리할 수 있도록 DefaultOAuth2User 객체를 반환합니다.
 */

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final AccountMapper accountMapper;
    private final PasswordEncoder passwordEncoder; // 소셜 회원은 비밀번호가 없으므로, 임시 비밀번호 암호화에 사용

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        // 1. 기본 OAuth2UserService 객체 생성
        OAuth2UserService<OAuth2UserRequest, OAuth2User> oAuth2UserService = new DefaultOAuth2UserService();

        // 2. 사용자 정보 받아오기 (토큰 교환 및 사용자 정보 API 호출 자동 수행)
        OAuth2User oAuth2User = oAuth2UserService.loadUser(userRequest);

        // 3. 서비스 구분 코드(registrationId) 및 PK가 되는 키(userNameAttributeName) 확인
        String registrationId = userRequest.getClientRegistration().getRegistrationId(); // "naver", "kakao" 등
        String userNameAttributeName = userRequest.getClientRegistration()
                .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName(); // PK 키 (네이버: response, 카카오: id)

        // 4. 받아온 사용자 정보를 우리 시스템에 맞게 정규화 (OAuthAttributes DTO 사용)
        OAuthAttributes attributes = OAuthAttributes.of(registrationId, userNameAttributeName, oAuth2User.getAttributes());

        // 5. DB에 회원 정보 저장 또는 업데이트
        AccountDTO account = saveOrUpdate(attributes);

        // 6. Spring Security 세션에 저장할 인증 객체(DefaultOAuth2User) 생성
        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + account.getRole())),
                attributes.getAttributes(),
                attributes.getNameAttributeKey()
        );
    }

    /**
     * OAuth2 사용자 정보를 기반으로 DB에 저장하거나 업데이트합니다.
     *
     * @param attributes 정규화된 사용자 정보
     * @return 저장되거나 업데이트된 AccountDTO
     */
    private AccountDTO saveOrUpdate(OAuthAttributes attributes) {
        // provider와 providerId를 조합하여 고유 ID로 사용 (예: "naver_123456")
        String providerId = attributes.getProvider() + "_" + attributes.getProviderId();

        AccountDTO account = accountMapper.selectAccountByProviderId(providerId);

        if (account != null) {
            // 이미 가입된 회원인 경우: 이름, 이메일 등 변경 사항이 있다면 업데이트
            account.setName(attributes.getName());
            account.setEmail(attributes.getEmail());
            // 필요한 경우 update 로직 추가 (accountMapper.updateSocialUser(account);)
            return account;
        }

        // 신규 가입인 경우
        // 소셜 로그인은 별도 ID/PW를 사용하지 않으므로, login_id는 고유하게, password는 임의로 설정
        String loginId = attributes.getEmail() != null ? attributes.getEmail() : providerId;

        // login_id 중복 체크 (이메일이 없는 경우 providerId로, 이메일이 있어도 중복될 수 있으므로)
        if(accountMapper.selectAccountByLoginId(loginId) != null) {
            loginId = providerId; // 이메일이 중복되면 providerId로 대체
        }

        AccountDTO newAccount = AccountDTO.builder()
                .loginId(loginId)
                .password(passwordEncoder.encode(UUID.randomUUID().toString())) // 임시 비밀번호
                .name(attributes.getName())
                .email(attributes.getEmail())
                .role("USER") // 기본 권한
                .provider(attributes.getProvider()) // "naver" 또는 "kakao"
                .providerId(providerId)
                .build();

        accountMapper.insertSocialUser(newAccount); // 소셜 회원가입용 Mapper 메서드

        return newAccount;
    }
}

