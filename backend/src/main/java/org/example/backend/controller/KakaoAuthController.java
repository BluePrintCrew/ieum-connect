package org.example.backend.controller;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.example.backend.domain.User;
import org.example.backend.dto.UserDTO;
import org.example.backend.service.KakaoLoginService;
import org.example.backend.service.KakaoSignUpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class KakaoAuthController {
    private final KakaoSignUpService kakaoSignUpService;
    private final KakaoLoginService kakaoLoginService;

    @PostMapping("/kakao")
    public ResponseEntity<UserDTO> kakaoLogin(@RequestBody KakaoLoginRequest request) {
        // 기존 회원인지 확인
        Optional<User> existingUser = kakaoLoginService.findByKakaoId(request.getKakaoId());

        User user;
        if (existingUser.isPresent()) {
            // 기존 회원이면 로그인 처리
            user = existingUser.get();
        } else {
            // 신규 회원이면 회원가입 처리
            user = kakaoSignUpService.signUp(request.getKakaoId(), request.getNickname());
        }

        UserDTO userDTO = UserDTO.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .build();

        return ResponseEntity.ok(userDTO);
    }
}

