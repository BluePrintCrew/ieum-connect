package org.example.backend;

import org.example.backend.domain.*;
import org.example.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

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
                // 1. User 생성
                User user = new User();
                user.setUsername("testUser");
                user.setKakaoId("test_kakao_id");

                user = userRepository.save(user);

                // 2. Story 생성
                Story story = new Story();
                story.setUser(user);
                story.setTitle("Test Story");
                story.setDescription("This is a test story");
                story.setVisibility(Story.Visibility.PRIVATE);
                story = storyRepository.save(story);

                // 3. Route 생성
                Route route = new Route();
                route.setName("Test Route");
                route.setStory(story);
                route = routeRepository.save(route);

                // 4. RoutePoint 생성
                RoutePoint point1 = new RoutePoint();
                point1.setRoute(route);
                // bigdecimal을 사용할시 double값으로 지정을 해버리면 그 근사값이 bigdecimal에 들어가게 된다.
                point1.setLatitude(new BigDecimal("37.6656"));
                point1.setLongitude(new BigDecimal("128.96542"));
                point1.setOrderNum(1);
                routePointRepository.save(point1);

                RoutePoint point2 = new RoutePoint();
                point2.setRoute(route);
                point2.setLatitude(new BigDecimal("37.4572"));
                point2.setLongitude(new BigDecimal("128.5621"));
                point2.setOrderNum(2);
                routePointRepository.save(point2);

                Hashtag hashtag1 = new Hashtag();
                hashtag1.setName("testasdfasdf");
                hashtagRepository.save(hashtag1);
                Hashtag hashtag2 = new Hashtag();
                hashtag2.setName("sample");
                hashtagRepository.save(hashtag2);


                // 6. Route에 Hashtag 연결
                route.addHashtag(hashtag1);
                route.addHashtag(hashtag2);
                routeRepository.save(route);

                System.out.println("Sample data has been loaded successfully.");
            } catch (Exception e) {
                System.err.println("Error occurred while loading sample data: " + e.getMessage());
                e.printStackTrace();
            }
        };
    }
}