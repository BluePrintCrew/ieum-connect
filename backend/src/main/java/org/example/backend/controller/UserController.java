package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.StoryDTO;
import org.example.backend.dto.UserDTO;
import org.example.backend.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/{userId}/nickname")
    public UserDTO getNickname(@PathVariable Long userId) {
        return userService.getNickname(userId);
    }

    @PostMapping("/nickname")
    public UserDTO.updateDTO updateNickname(@RequestBody UserDTO.updateDTO userDTO) {
        return userService.updateNickname(userDTO);
    }
}