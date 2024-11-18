package org.example.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDTO {
    private Long userId;
    private String username;
    private String nickname;

    @Data
    @Builder
    public static class updateDTO {
        private String nickname;
        private Long userId;
    }
}
