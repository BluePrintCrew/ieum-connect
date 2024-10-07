package org.example.backend.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.example.backend.domain.Story;

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
    public static class UpdateStoryRequest {
        private String title;
        private String description;
       // private int preference;
        private List<String> hashtags;
        private Story.Visibility visibility;

    }

    @Data
    public static class CreateStoryResponse {
        private String status;
        private String message;
        private Long savedStoryId;
        private ZonedDateTime createdAt;
    }

    @Data
    @RequiredArgsConstructor
    @AllArgsConstructor
    public static class ErrorResponse {
        private String status;
        private String message;
    }
}