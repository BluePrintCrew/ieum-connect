package org.example.backend;
//
//import org.example.backend.domain.*;
//import org.example.backend.repository.*;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
//@Configuration
//public class DataLoader {
//
//    @Bean
//    public CommandLineRunner loadData(UserRepository userRepository,
//                                      StoryRepository storyRepository,
//                                      RouteRepository routeRepository,
//                                      RoutePointRepository routePointRepository,
//                                      HashtagRepository hashtagRepository) {
//        return args -> {
//            // 여기에 데이터 삽입 로직을 작성합니다.
//
//            // 1. User 생성
//            User user = new User();
//            user.setUsername("testUser");
//            user = userRepository.save(user);
//
//            // 2. Story 생성
//            Story story = new Story();
//            story.setUser(user);
//            story.setTitle("Test Story");
//            story.setDescription("This is a test story");
//            story.setVisibility(Story.Visibility.PRIVATE);
//            story = storyRepository.save(story);
//
//            // 3. Route 생성
//            Route route = new Route();
//            route.setName("Test Route");
//            route.setStory(story);
//            route = routeRepository.save(route);
//
//            // 4. RoutePoint 생성
//            RoutePoint point1 = new RoutePoint();
//            point1.setRoute(route);
//            point1.setLatitude(37.5665);
//            point1.setLongitude(126.9780);
//            point1.setOrderNum(1);
//            routePointRepository.save(point1);
//
//            RoutePoint point2 = new RoutePoint();
//            point2.setRoute(route);
//            point2.setLatitude(37.5665);
//            point2.setLongitude(126.9780);
//            point2.setOrderNum(2);
//            routePointRepository.save(point2);
//
//            // 5. Hashtag 생성
//            Hashtag hashtag1 = new Hashtag();
//            hashtag1.setName("test");
//            hashtag1 = hashtagRepository.save(hashtag1);
//
//            Hashtag hashtag2 = new Hashtag();
//            hashtag2.setName("sample");
//            hashtag2 = hashtagRepository.save(hashtag2);
//
//            // 6. Route에 Hashtag 연결
//            route.getHashtags().add(hashtag1);
//            route.getHashtags().add(hashtag2);
//            routeRepository.save(route);
//
//            System.out.println("Sample data has been loaded.");
//        };
//    }
//}