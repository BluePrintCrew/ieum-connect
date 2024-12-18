package org.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.backend.domain.Story;

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
        private Story.Visibility visibility;
        private Story.PlanState planState;
        private UserDTO user;
        private RouteDTO route;
        private int preference;
        private List<PhotoDTO> photos;
        private List<String> hashtags;
        private boolean isFollowing; // 팔로우 상태를 나타내는 필드 추가
        private boolean isLiked;      // 좋아요 상태 추가
        // 좋아요 수 필드 추가
        private int likeCount;
        // 댓글 목록 필드 추가
        private List<CommentDTO> comments;
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
        private String address;       // 지번 주소
        private String roadAddress;   // 도로명 주소
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

    // 댓글 DTO 추가
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommentDTO {
        private Long commentId;
        private String content;
        private LocalDateTime createdAt;
        private String username;
    }
}