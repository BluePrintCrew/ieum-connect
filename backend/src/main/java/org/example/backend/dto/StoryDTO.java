package org.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class StoryDTO {
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long storyId;
        private String title;
        private String description;
        private LocalDateTime createdAt;
        private String visibility;
        private UserDTO user;
        private RouteDTO route;
        private List<PhotoDTO> photos;
        private List<String> hashtags;
        private int photoCount;

        // 생성자, getter, setter 등은 lombok 어노테이션으로 대체
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDTO {
        private Long userId;
        private String username;
        // 필요한 다른 사용자 정보 필드
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RouteDTO {
        private Long routeId;
        private String name;
        private List<RoutePointDTO> routePoints;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoutePointDTO {
        private Long routePointId;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private Integer orderNum;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PhotoDTO {
        private Long photoId;
        private String filePath;
        private LocalDateTime takenAt;
        private BigDecimal latitude;
        private BigDecimal longitude;
    }
}