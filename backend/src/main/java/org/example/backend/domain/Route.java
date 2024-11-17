package org.example.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "routes")
@Getter
@Setter
public class Route {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "route_id")
    private Long routeId;

    // 경로와 스토리는 일대일 대응
    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "story_id", unique = true)
    private Story story;

    private String name;

    // 하나의 경로는 여러가지 spot을 가질 수 있다.
    // 그리고 경로가 삭제 될 시 여러개의 spot도 자동 삭제된다.
    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoutePoint> routePoints = new ArrayList<>();

    // 다대다 관계 -> 해시테그 하나도 여러개의 route를 가질 수 있고, route 또한 여러개의 hashtag를 가질 수 있다.
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "route_hashtags",
            joinColumns = @JoinColumn(name = "route_id"),
            inverseJoinColumns = @JoinColumn(name = "hashtag_id")
    )
    private List<Hashtag> hashtags = new ArrayList<>();

    public void setStory(Story story) {
        this.story = story;
        if (story.getRoute() != this) {
            story.setRoute(this);
        }
    }

    public void addRoutePoint(RoutePoint routePoint) {
        this.routePoints.add(routePoint);
        routePoint.setRoute(this);
    }

    public void addHashtag(Hashtag hashtag) {
        this.hashtags.add(hashtag);
    }


    // Getters and setters
    // ...

    // routepoint에 사진을 넣어야할지를 생ㄱ
}