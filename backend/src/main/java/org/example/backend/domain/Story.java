package org.example.backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "memories")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Story {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "story_id")
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

    //
    @Enumerated(EnumType.STRING)
    private PlanState planState;

    // 사진과 story는 일대 다
    @OneToMany(mappedBy = "story", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Photo> photos = new ArrayList<>();

    // 스토리와 경로는 일대일 관계 -> 하나의 스토리는 하나의 경로만 가질 수 있다.
    @OneToOne(mappedBy = "story", cascade = CascadeType.ALL, orphanRemoval = true)
    private Route route;


    // 좋아요 수를 저장하는 필드 추가
    @Builder.Default
    @Column(name = "like_count", columnDefinition = "integer default 0")
    private Integer likeCount = 0;

    @Builder.Default
    @OneToMany(mappedBy = "story", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, orphanRemoval = true)
    private List<Like> likes = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "story", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    @Column(name ="preference")
    private int preference;

    // Getters and setters
    // ...

    public void setRoute(Route route) {
        this.route = route;
        if (route != null && route.getStory() != this) {
            route.setStoryOnly(this);
        }
    }

    // 무한 순환 참조를 방지하기 위한 내부 메소드
    public void setRouteOnly(Route route) {
        this.route = route;
    }


    public void addPhoto(Photo photo) {
        this.photos.add(photo);
        photo.setStory(this);
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Friend 기능은 추후에 결정
    public enum Visibility {
        PUBLIC, PRIVATE, FRIENDS_ONLY
    }
    public enum PlanState{
        PUBLISH, PLANNED
    }
}