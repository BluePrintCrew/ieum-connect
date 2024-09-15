package org.example.ieum.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "photos")
@Getter
@Setter
public class Photo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "photo_Id")
    private Long photoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "memory_id", nullable = false)
    private Story story;

    @Column(nullable = false)
    private String filePath;

    @Column(nullable = false, name = "taken_at")
    private LocalDateTime takenAt;

    @Column(nullable = false, precision = 10, scale = 8)
    private Double latitude;

    @Column(nullable = false, precision = 11, scale = 8)
    private Double longitude;


}