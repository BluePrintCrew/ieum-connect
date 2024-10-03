package org.example.backend.domain;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "hashtags")
public class Hashtag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long hashtagId;

    @Column( unique = true)
    private String name;

    @ManyToMany(mappedBy = "hashtags")
    private List<Route> routes = new ArrayList<>();

    // Getters and setters
    // ...
}
