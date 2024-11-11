package org.example.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@Table(name = "route_points")
public class RoutePoint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "point_id")
    private Long routePointId;

    // spot과 route는 다대일 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    // 위도
    // 위도는 -90 ~ 90 사이이고 , JPEG의 소수점은 6~7 사이의 소수점으로 표기된다.
    // 하지만 최대 8자리의 소수점으로 표기된다면 1mm 단위로도 사용이 가능함. 그러므로 scale은 8
    // double로는 표현할 수 없는 것이다. BigDecimal 또는 명시적으로 데이터타입을 decimal(10,8)로 지정했어야함
    @Column( precision = 10, scale = 8)
    private BigDecimal latitude;

    // 경도
    // 경도는 -180 ~ 180 사이이고, JPEG의 소수점도 6~7사이로같다
    @Column( precision = 11, scale = 8)
    private BigDecimal longitude;

    // 사진데이터를 받아올때 그 route point가 몇번째의 순서로 저장되는 지에 대한 정보를 저장
    // -> 수정에 대해서는 나중에 생각해보자.
    //@Column(nullable = false)
    private Integer orderNum;

    // Getters and setters
    // ...
    private String address;       // 지번 주소
    private String roadAddress;   // 도로명 주소
}