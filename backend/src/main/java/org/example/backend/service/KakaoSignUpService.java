package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.domain.User;
import org.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KakaoSignUpService {
    private final UserRepository userRepository;

    public User signUp(String kakaoId, String nickname) {
        User user = new User();
        user.setKakaoId(kakaoId);
        user.setUsername(nickname);
        user.setNickname(nickname);

        return userRepository.save(user);
    }
}