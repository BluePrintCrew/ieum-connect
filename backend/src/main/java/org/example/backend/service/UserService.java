package org.example.backend.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.backend.domain.User;
import org.example.backend.dto.UserDTO;
import org.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserDTO getNickname(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        return UserDTO.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .build();
    }

    public UserDTO.updateDTO updateNickname(UserDTO.updateDTO userDTO) {
        User user = userRepository.findById(userDTO.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userDTO.getUserId()));

        user.setNickname(userDTO.getNickname());
        User savedUser = userRepository.save(user);

        return UserDTO.updateDTO.builder()
                .userId(savedUser.getUserId())
                .nickname(savedUser.getNickname())
                .build();
    }

    public User findByUserId(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
    }
}