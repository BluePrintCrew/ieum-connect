package org.example.ieum.domain;


import jakarta.persistence.Entity;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "stroies")
public class Story {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long memoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private Visibility visibility;

    @OneToMany(mappedBy = "memory", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Photo> photos = new ArrayList<>();

    @OneToOne(mappedBy = "memory", cascade = CascadeType.ALL, orphanRemoval = true)
    private Route route;


    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum Visibility {
        PUBLIC, PRIVATE
    }
}