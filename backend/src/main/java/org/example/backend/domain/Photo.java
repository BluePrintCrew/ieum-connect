package org.example.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

// 사진 - spot 과 별개임 사진을 보관하는 table이 따로 존재해야한다.

@Entity
@Getter
@Setter
@Table(name = "photos")
public class Photo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "photo_id")
    private Long photoId;

    // 사진과 스토리는 다대일
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "story_id", nullable = false)
    private Story story;

    // 사진 파일 경로
    @Column(nullable = false)
    private String filePath;

    // 저장 시간
    @Column(nullable = false)
    private LocalDateTime takenAt;

    // 위도
    @Column(nullable = false, precision = 10, scale = 8)
    private Double latitude;

    // 경도
    @Column(nullable = false, precision = 11, scale = 8)
    private Double longitude;

    // Getters and setters
    // ...
}