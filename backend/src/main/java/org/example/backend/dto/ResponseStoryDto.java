package org.example.backend.dto;


import lombok.Data;

import java.time.ZonedDateTime;
import java.util.List;

public class ResponseStoryDto {

    @Data
    public static class CreateStoryRequest {
        private String title;
        private String memo;
        private int preference;
        private List<String> hashtags;

    }

    @Data
    public static class CreateStoryResponse {
        private String status;
        private String message;
        private Long savedStoryId;
        private ZonedDateTime createdAt;
    }

    @Data
    public static class ErrorResponse {
        private String status;
        private String message;
    }
}