package org.example.ieum.domain;



import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "routes")
public class Route {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long routeId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "memory_id", unique = true, nullable = false)
    private Story story;

    private String name;

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoutePoint> routePoints = new ArrayList<>();

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "route_hashtags",
            joinColumns = @JoinColumn(name = "route_id"),
            inverseJoinColumns = @JoinColumn(name = "hashtag_id")
    )
    private List<Hashtag> hashtags = new ArrayList<>();

    // Getters and setters
    // ...
}