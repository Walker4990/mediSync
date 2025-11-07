package com.mediSync.project.config;

import com.mediSync.project.medical.vo.UserAccount;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;

@Getter
public class PrincipalDetails implements UserDetails, OAuth2User {

    private UserAccount user;
    private Map<String, Object> attributes; // OAuth2 속성

    // 일반 로그인 시 사용 (UserAccount)
    public PrincipalDetails(UserAccount user) {
        this.user = user;
    }

    // OAuth 로그인 시 사용 (UserAccount + 속성)
    public PrincipalDetails(UserAccount user, Map<String, Object> attributes) {
        this.user = user;
        this.attributes = attributes;
    }

    // (UserDetails 구현)
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // 권한 (role) 설정
        Collection<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(() -> user.getRole()); // "USER", "ADMIN" 등
        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        // 여기서 loginId를 반환해야 함
        return user.getLoginId();
    }

    // (계정 만료, 잠김 등은 모두 true로)
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }

    // (OAuth2User 구현)
    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public String getName() {
        // OAuth2 공급자가 반환하는 고유 ID 값 (사용 안 할 수도 있음)
        return attributes.get("id") != null ? attributes.get("id").toString() : null;
    }
}