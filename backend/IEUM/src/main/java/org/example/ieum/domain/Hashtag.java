package org.example.ieum.domain;

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
    @Column(name = "hashtag_id")
    private Long hashtagId;

    @Column(nullable = false, unique = true)
    private String name;

    @ManyToMany(mappedBy = "hashtags")
    private List<Route> routes = new ArrayList<>();


}