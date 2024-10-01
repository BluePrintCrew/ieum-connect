package org.example.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    // 추후 설정할 카카오 소셜로그인 id -> token 값을 저장할 것인지 고유 번호를 저장할 것인지는 생각해봐야함
    @Column(nullable = false, unique = true, name = "kakao_id")
    private String kakaoId;


    @Column(nullable = false, name = "user_name")
    private String username;

    private String nickname;

    // 이미지 url
    private String profileImageUrl;

    // 생성 시간
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 많은 user들은 자신의 스토리들을 생성할 수 있다.
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Story> Stories = new ArrayList<>();

    // Getters and setters
    // ...

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}