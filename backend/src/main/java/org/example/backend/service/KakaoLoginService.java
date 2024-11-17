package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.domain.User;
import org.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class KakaoLoginService {
    private final UserRepository userRepository;

    public User processKakaoUser(String kakaoId, String nickname) {
        // 기존 회원인지 확인
        return userRepository.findByKakaoId(kakaoId)
                .orElseGet(() -> createKakaoUser(kakaoId, nickname));
    }

    private User createKakaoUser(String kakaoId, String nickname) {
        User user = new User();
        user.setKakaoId(kakaoId);
        user.setUsername(nickname);
        user.setNickname(nickname);


        return userRepository.save(user);
    }
}