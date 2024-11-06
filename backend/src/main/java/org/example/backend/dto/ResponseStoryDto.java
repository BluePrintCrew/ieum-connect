package org.example.backend.dto;


import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.example.backend.domain.Story;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

public class ResponseStoryDto {

    @Data
    public static class CreateStoryRequest {
        private String title;
        private String memo;
        private int preference;
        private List<String> hashtags;
        private List<RoutePointDTO> routePoints;

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

    @Data
    @RequiredArgsConstructor
    @AllArgsConstructor
    public static class RoutePointDTO{
        private BigDecimal latitude;
        private BigDecimal longitude;
        private Integer orderNum;

    }
}

