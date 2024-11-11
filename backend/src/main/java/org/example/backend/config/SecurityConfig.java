package org.example.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .authorizeHttpRequests()
                .requestMatchers("/api/**").permitAll()  // API 엔드포인트 허용
                .requestMatchers("/", "/**").permitAll() // 모든 경로 허용  // API 엔드포인트에 대한 접근 허용
                .anyRequest().authenticated()
                .and()
                .formLogin().disable()
                .httpBasic();

        return http.build();
    }
}