package org.example.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LikeDto {
    private Long id;
    private Long storyId;
    private Long userId;
    private LocalDateTime createdAt;

    @Data
    public static class LikeCreateDto{
        private Long storyId;
        private Long userId;
    }


}
