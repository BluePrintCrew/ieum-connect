package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.domain.Like;
import org.example.backend.dto.LikeDto;
import org.example.backend.service.LikeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/likes")
public class LikeController {
    private final LikeService likeService;

    @PostMapping
    public ResponseEntity<?> addLike(@RequestBody LikeDto.LikeCreateDto likeDto) {
        Like like = likeService.addLike(likeDto);
        return ResponseEntity.ok(like);
    }

    @DeleteMapping("/{likeId}")
    public ResponseEntity<?> removeLike(@PathVariable Long likeId) {
        likeService.removeLike(likeId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/story/{storyId}")
    public ResponseEntity<?> getLikesByStory(@PathVariable Long storyId) {
        List<Like> likes = likeService.getLikesByStory(storyId);
        return ResponseEntity.ok(likes);
    }
}
