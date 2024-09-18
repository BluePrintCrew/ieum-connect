package org.example.backend.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "route_points")
public class RoutePoint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "point_id")
    private Long pointId;

    // spot과 route는 다대일 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    // 위도
    // 위도는 -90 ~ 90 사이이고 , JPEG의 소수점은 6~7 사이의 소수점으로 표기된다.
    // 하지만 최대 8자리의 소수점으로 표기된다면 1mm 단위로도 사용이 가능함. 그러므로 scale은 8
    @Column(nullable = false, precision = 10, scale = 8)
    private Double latitude;

    // 경도
    // 경도는 -180 ~ 180 사이이고, JPEG의 소수점도 6~7사이로같다
    @Column(nullable = false, precision = 11, scale = 8)
    private Double longitude;

    // 사진데이터를 받아올때 그 route point가 몇번째의 순서로 저장되는 지에 대한 정보를 저장
    // -> 수정에 대해서는 나중에 생각해보자.
    @Column(nullable = false)
    private Integer orderNum;

    // Getters and setters
    // ...
}