package org.example.backend.dto;

import lombok.Builder;
import lombok.Data;
import org.example.backend.domain.Follow;

import java.time.LocalDateTime;

@Data
@Builder
public class FollowDTO {
    private Long id;
    private Long followerId;
    private Long followingId;
    private String followerNickname;
    private String followingNickname;
    private LocalDateTime createdAt;

    @Data
    @Builder
    public static class RequestDTO {
        private Long followerId;
        private Long followingId;
    }

    public static FollowDTO fromEntity(Follow follow) {
        return FollowDTO.builder()
                .id(follow.getId())
                .followerId(follow.getFollower().getUserId())
                .followingId(follow.getFollowing().getUserId())
                .followerNickname(follow.getFollower().getNickname())
                .followingNickname(follow.getFollowing().getNickname())
                .createdAt(follow.getCreatedAt())
                .build();
    }
}
