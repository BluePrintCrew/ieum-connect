package org.example.backend.controller;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.example.backend.domain.User;
import org.example.backend.service.KakaoLoginService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class KakaoAuthController {
    private final KakaoLoginService kakaoLoginService;

    @PostMapping("/kakao")
    public ResponseEntity<User> kakaoLogin(@RequestBody KakaoLoginRequest request) {
        User user = kakaoLoginService.processKakaoUser(request.getKakaoId(), request.getNickname());
        return ResponseEntity.ok(user);
    }
}
