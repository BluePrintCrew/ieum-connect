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
@Table(name = "memories")
public class Story {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stroy_id")
    private Long storyId;

    // 관계의 주인
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 스토리의 제목
    @Column(nullable = false)
    private String title;

    // 스토리 설명 -> 일단 하나의 스토리 자체에 설명을 기입할 수 있도록 설계
    private String description;

    // 스토리가 만들어질때 기준
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;


    // 일단 친구 관련 접근 가능확장성 고려
    @Enumerated(EnumType.STRING)
    private Visibility visibility;

    // 사진과 story는 일대 다
    @OneToMany(mappedBy = "story", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Photo> photos = new ArrayList<>();

    // 스토리와 경로는 일대일 관계 -> 하나의 스토리는 하나의 경로만 가질 수 있다.
    @OneToOne(mappedBy = "story", cascade = CascadeType.ALL, orphanRemoval = true)
    private Route route;

    // 좋아요 리스트 추가
    @OneToMany(mappedBy = "story", cascade = CascadeType.ALL)
    private List<Like> likes = new ArrayList<>();

    // 좋아요 수를 저장하는 필드 추가
    @Column(name = "like_count", columnDefinition = "integer default 0")
    private Integer likeCount = 0;

    // 댓글 리스트 추가
    @OneToMany(mappedBy = "story", cascade = CascadeType.ALL)
    private List<Comment> comments = new ArrayList<>();


    // Getters and setters
    // ...

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Friend 기능은 추후에 결정
    public enum Visibility {
        PUBLIC, PRIVATE, FRIENDS_ONLY
    }
}