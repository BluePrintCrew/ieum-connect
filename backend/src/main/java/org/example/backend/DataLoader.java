package org.example.backend;

import org.example.backend.domain.*;
import org.example.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Transactional
@Configuration
public class DataLoader {

    @Bean
    public CommandLineRunner loadData(UserRepository userRepository,
                                      StoryRepository storyRepository,
                                      RouteRepository routeRepository,
                                      RoutePointRepository routePointRepository,
                                      HashtagRepository hashtagRepository) {
        return args -> {
            try {
                // 1. Create Users
                User user1 = createUser("traveler_kim", "kakao_id_123");
                User user2 = createUser("explorer_lee", "kakao_id_456");
                userRepository.saveAll(List.of(user1, user2));

                // 2. Create Hashtags
                List<Hashtag> hashtags = createHashtags(hashtagRepository);

                // 3. Create Stories with Routes and RoutePoints
                createStory1(user1, hashtags.subList(0, 3), storyRepository, routeRepository, routePointRepository);
                createStory2(user1, hashtags.subList(2, 5), storyRepository, routeRepository, routePointRepository);
                createStory3(user2, hashtags.subList(1, 4), storyRepository, routeRepository, routePointRepository);
                createStory4(user2, hashtags.subList(3, 6), storyRepository, routeRepository, routePointRepository);
                createStory5(user1, hashtags.subList(4, 7), storyRepository, routeRepository, routePointRepository);

                System.out.println("Sample data has been loaded successfully.");
            } catch (Exception e) {
                System.err.println("Error occurred while loading sample data: " + e.getMessage());
                e.printStackTrace();
            }
        };
    }

    private User createUser(String username, String kakaoId) {
        User user = new User();
        user.setUsername(username);
        user.setKakaoId(kakaoId);
        return user;
    }

    private List<Hashtag> createHashtags(HashtagRepository hashtagRepository) {
        List<Hashtag> hashtags = Arrays.asList(
                createHashtag("서울여행"),
                createHashtag("맛집탐방"),
                createHashtag("카페투어"),
                createHashtag("부산여행"),
                createHashtag("힐링"),
                createHashtag("데이트코스"),
                createHashtag("주말여행")
        );
        return hashtagRepository.saveAll(hashtags);
    }

    private Hashtag createHashtag(String name) {
        Hashtag hashtag = new Hashtag();
        hashtag.setName(name);
        return hashtag;
    }

    private void createStory1(User user, List<Hashtag> hashtags,
                              StoryRepository storyRepository,
                              RouteRepository routeRepository,
                              RoutePointRepository routePointRepository) {
        // 서울 도심 코스
        Story story = new Story();
        story.setUser(user);
        story.setTitle("서울 도심 데이트 코스");
        story.setDescription("광화문부터 덕수궁까지 도심 산책");
        story.setVisibility(Story.Visibility.PUBLIC);
        story.setPreference(4);
        story = storyRepository.save(story);

        Route route = new Route();
        route.setName("도심 산책로");
        route.setStory(story);
        route = routeRepository.save(route);

        List<RoutePoint> points = Arrays.asList(
                createRoutePoint(route, "37.576", "126.976", 1, "서울 종로구 세종로 사거리"), // 광화문
                createRoutePoint(route, "37.571", "126.978", 2, "서울 중구 정동길"), // 덕수궁
                createRoutePoint(route, "37.568", "126.981", 3, "서울 중구 명동길") // 명동
        );
        routePointRepository.saveAll(points);

        hashtags.forEach(route::addHashtag);
        routeRepository.save(route);
    }

    private void createStory2(User user, List<Hashtag> hashtags,
                              StoryRepository storyRepository,
                              RouteRepository routeRepository,
                              RoutePointRepository routePointRepository) {
        // 부산 해운대 코스
        Story story = new Story();
        story.setUser(user);
        story.setTitle("부산 해운대 여행");
        story.setDescription("해운대에서 광안리까지 부산 필수 코스");
        story.setVisibility(Story.Visibility.PUBLIC);
        story.setPreference(5);
        story = storyRepository.save(story);

        Route route = new Route();
        route.setName("해운대 코스");
        route.setStory(story);
        route = routeRepository.save(route);

        List<RoutePoint> points = Arrays.asList(
                createRoutePoint(route, "35.158", "129.160", 1, "부산 해운대구 해운대해수욕장"), // 해운대
                createRoutePoint(route, "35.156", "129.152", 2, "부산 해운대구 달맞이길"), // 달맞이길
                createRoutePoint(route, "35.153", "129.118", 3, "부산 수영구 광안리해수욕장") // 광안리
        );
        routePointRepository.saveAll(points);

        hashtags.forEach(route::addHashtag);
        routeRepository.save(route);
    }

    private void createStory3(User user, List<Hashtag> hashtags,
                              StoryRepository storyRepository,
                              RouteRepository routeRepository,
                              RoutePointRepository routePointRepository) {
        // 강남 카페 투어
        Story story = new Story();
        story.setUser(user);
        story.setTitle("강남 카페 투어");
        story.setDescription("강남 숨은 카페 찾기");
        story.setVisibility(Story.Visibility.PRIVATE);
        story.setPreference(3);
        story = storyRepository.save(story);

        Route route = new Route();
        route.setName("강남 카페로");
        route.setStory(story);
        route = routeRepository.save(route);

        List<RoutePoint> points = Arrays.asList(
                createRoutePoint(route, "37.504", "127.049", 1, "서울 강남구 가로수길"), // 가로수길
                createRoutePoint(route, "37.507", "127.056", 2, "서울 강남구 신사동"), // 신사동
                createRoutePoint(route, "37.514", "127.052", 3, "서울 강남구 압구정로") // 압구정
        );
        routePointRepository.saveAll(points);

        hashtags.forEach(route::addHashtag);
        routeRepository.save(route);
    }

    private void createStory4(User user, List<Hashtag> hashtags,
                              StoryRepository storyRepository,
                              RouteRepository routeRepository,
                              RoutePointRepository routePointRepository) {
        // 이태원 맛집 투어
        Story story = new Story();
        story.setUser(user);
        story.setTitle("이태원 맛집 투어");
        story.setDescription("이태원 세계 음식 여행");
        story.setVisibility(Story.Visibility.PUBLIC);
        story.setPreference(4);
        story = storyRepository.save(story);

        Route route = new Route();
        route.setName("이태원 맛집로");
        route.setStory(story);
        route = routeRepository.save(route);

        List<RoutePoint> points = Arrays.asList(
                createRoutePoint(route, "37.534", "126.994", 1, "서울 용산구 이태원로"), // 이태원역
                createRoutePoint(route, "37.535", "126.990", 2, "서울 용산구 경리단길"), // 경리단길
                createRoutePoint(route, "37.537", "126.997", 3, "서울 용산구 해방촌") // 해방촌
        );
        routePointRepository.saveAll(points);

        hashtags.forEach(route::addHashtag);
        routeRepository.save(route);
    }

    private void createStory5(User user, List<Hashtag> hashtags,
                              StoryRepository storyRepository,
                              RouteRepository routeRepository,
                              RoutePointRepository routePointRepository) {
        // 홍대 데이트 코스
        Story story = new Story();
        story.setUser(user);
        story.setTitle("홍대 데이트 코스");
        story.setDescription("홍대 핫플레이스 탐방");
        story.setVisibility(Story.Visibility.PUBLIC);
        story.setPreference(5);
        story = storyRepository.save(story);

        Route route = new Route();
        route.setName("홍대 투어");
        route.setStory(story);
        route = routeRepository.save(route);

        List<RoutePoint> points = Arrays.asList(
                createRoutePoint(route, "37.557", "126.924", 1, "서울 마포구 홍대입구역"), // 홍대입구
                createRoutePoint(route, "37.561", "126.926", 2, "서울 마포구 연남동"), // 연남동
                createRoutePoint(route, "37.563", "126.921", 3, "서울 마포구 상수동") // 상수동
        );
        routePointRepository.saveAll(points);

        hashtags.forEach(route::addHashtag);
        routeRepository.save(route);
    }

    private RoutePoint createRoutePoint(Route route, String lat, String lon, int orderNum, String address) {
        RoutePoint point = new RoutePoint();
        point.setRoute(route);
        point.setLatitude(new BigDecimal(lat));
        point.setLongitude(new BigDecimal(lon));
        point.setOrderNum(orderNum);
        point.setAddress(address);
        point.setRoadAddress(address + " 로"); // 간단한 예시
        return point;
    }
}