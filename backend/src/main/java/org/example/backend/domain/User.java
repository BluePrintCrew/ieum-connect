package org.example.backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    // 추후 설정할 카카오 소셜로그인 id -> token 값을 저장할 것인지 고유 번호를 저장할 것인지는 생각해봐야함
    @Column( unique = true, name = "kakao_id")
    private String kakaoId;


    @Column( name = "user_name")
    private String username;

    private String nickname;

    @OneToMany(mappedBy = "follower")
    private List<Follow> followings = new ArrayList<>();  // 내가 팔로우하는 사람들

    @OneToMany(mappedBy = "following")
    private List<Follow> followers = new ArrayList<>();   // 나를 팔로우하는 사람들

    // 팔로워 수와 팔로잉 수를 쉽게 가져오기 위한 메서드
    public int getFollowersCount() {
        return followers.size();
    }

    public int getFollowingsCount() {
        return followings.size();
    }

    // 생성 시간
    @Column( updatable = false)
    private LocalDateTime createdAt;

    // 많은 user들은 자신의 스토리들을 생성할 수 있다.
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Story> stories = new ArrayList<>();

    // Getters and setter
    // ...

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}