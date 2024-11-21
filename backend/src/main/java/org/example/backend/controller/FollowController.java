package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.FollowDTO;
import org.example.backend.service.FollowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Controller
@RestController
@RequestMapping("/api/follows")
@RequiredArgsConstructor
public class FollowController {
    private final FollowService followService;

    @PostMapping("")
    public ResponseEntity<FollowDTO> follow(@RequestBody FollowDTO.RequestDTO requestDTO) {
        return ResponseEntity.ok(followService.follow(requestDTO.getFollowerId(), requestDTO.getFollowingId()));
    }

    @DeleteMapping("")
    public ResponseEntity<Void> unfollow(@RequestBody FollowDTO.RequestDTO requestDTO) {
        followService.unfollow(requestDTO.getFollowerId(), requestDTO.getFollowingId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/followers/{userId}")
    public ResponseEntity<List<FollowDTO>> getFollowers(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.getFollowers(userId));
    }

    @GetMapping("/followings/{userId}")
    public ResponseEntity<List<FollowDTO>> getFollowings(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.getFollowings(userId));
    }
}