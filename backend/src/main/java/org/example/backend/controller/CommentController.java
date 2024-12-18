package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.domain.Comment;
import org.example.backend.dto.CommentDto;
import org.example.backend.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/comments")
public class CommentController {
    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<CommentDto> addComment(@RequestBody CommentDto.CommentCreateDto commentDto) {
        CommentDto comment = commentService.addComment(commentDto);
        return ResponseEntity.ok(comment);
    }

    @GetMapping("/story/{storyId}")
    public ResponseEntity<List<CommentDto>> getCommentsByStory(@PathVariable Long storyId) {
        List<CommentDto> comments = commentService.getCommentsByStory(storyId);
        return ResponseEntity.ok(comments);
    }
}