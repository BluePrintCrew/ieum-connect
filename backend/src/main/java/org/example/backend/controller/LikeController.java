package org.example.backend.controller;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.backend.domain.Like;
import org.example.backend.domain.Story;
import org.example.backend.domain.User;
import org.example.backend.dto.LikeDto;
import org.example.backend.repository.LikeRepository;
import org.example.backend.repository.StoryRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.service.LikeService;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/likes")
public class LikeController {
    private final LikeService likeService;

    @PostMapping
    public ResponseEntity<LikeDto> addLike(@RequestBody LikeDto.LikeCreateDto likeDto) {
        LikeDto response = likeService.addLike(likeDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<?> removeLike(@RequestParam Long userId, @RequestParam Long storyId) {
        likeService.removeLikeByUserAndStory(userId, storyId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/story/{storyId}")
    public ResponseEntity<List<LikeDto>> getLikesByStory(@PathVariable Long storyId) {
        List<LikeDto> likes = likeService.getLikesByStory(storyId);
        return ResponseEntity.ok(likes);
    }
}
