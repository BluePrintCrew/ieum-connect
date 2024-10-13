package org.example.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentDto {
    private Long id;
    private Long storyId;
    private Long userId;
    private String content;
    private LocalDateTime createdAt;

    // 생성자
    public CommentDto() {}

    public CommentDto(Long id, Long storyId, Long userId, String content, LocalDateTime createdAt) {
        this.id = id;
        this.storyId = storyId;
        this.userId = userId;
        this.content = content;
        this.createdAt = createdAt;
    }

    @Data
    public static class CommentCreateDto {
        private Long storyId;
        private Long userId;
        private String content;

        // 생성자, Getters and Setters
    }

}