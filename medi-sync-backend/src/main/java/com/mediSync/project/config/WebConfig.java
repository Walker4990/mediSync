package com.mediSync.project.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 모든 API 경로 허용
                .allowedOrigins("*") // ✅ 모든 IP, 모든 Origin 허용
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*") // ✅ 헤더도 모두 허용 (Content-Type 등)
                .allowCredentials(false); // ✅ * 사용 시 true 불가 (보안제약)
    }
}
