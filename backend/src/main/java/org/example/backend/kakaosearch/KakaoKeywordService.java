package org.example.backend.kakaosearch;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class KakaoKeywordService {
    private final RestTemplate restTemplate;
    @Value("${kakao.api.key}")  // application.properties에서 키를 가져오는지 확인
    private String kakaoApiKey;
    private final String KAKAO_API_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";

    private static final Map<String, String> TOURIST_CATEGORIES = Map.of(
            "AT4", "관광명소",
            "CT1", "문화시설"
    );

    public KakaoKeywordService() {
        this.restTemplate = new RestTemplate();
    }

    public List<String> searchByKeywords(String keyword) {
        log.info("Searching tourist spots and cultural places for keyword: {}", keyword);

        // 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.AUTHORIZATION, "KakaoAK " + kakaoApiKey);
        headers.set(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

        // 여행 명소리스트
        List<String> tourismSpots = new ArrayList<>();

        // 각 카테고리(관광명소, 문화시설)별로 검색 실행
        for (Map.Entry<String, String> category : TOURIST_CATEGORIES.entrySet()) {
            String url = KAKAO_API_URL + "?query=" + keyword
                    + "&category_group_code=" + category.getKey() // 각 카테고리에 대해서 검색
                    + "&size=5";  // 각 카테고리당 5개씩 검색

            log.info("Searching for category: {} with URL: {}", category.getValue(), url);

            HttpEntity<?> entity = new HttpEntity<>(headers);

            try {
                ResponseEntity<KakaoSearchResponse> response =
                        restTemplate.exchange(url, HttpMethod.GET, entity, KakaoSearchResponse.class);

                if (response.getBody() != null && response.getBody().getDocuments() != null) {
                    List<String> categoryResults = response.getBody().getDocuments().stream()
                            .map(KakaoSearchResponse.Document::getPlaceName) // placeName만 추출
                            .collect(Collectors.toList());

                    tourismSpots.addAll(categoryResults);

                    log.info("Found {} results for category {}",
                            categoryResults.size(),
                            category.getValue());
                }

            } catch (Exception e) {
                log.error("Error searching category {}: {}",
                        category.getValue(), e.getMessage());
            }
        }

        return tourismSpots.stream()
                .distinct()
                .collect(Collectors.toList());
    }

    // 관광 장소 정보를 담는 내부 클래스
    @Getter
    @AllArgsConstructor
    private static class TourismSpot {
        private String name;
        private String category;
        private String address;
        private String roadAddress;

        public String getAddress() {
            return roadAddress != null && !roadAddress.isEmpty()
                    ? roadAddress
                    : address;
        }
    }

//    // 키워드 검색
//    public KakaoSearchResponse searchByKeyword(String keyword) {
//        HttpHeaders headers = new HttpHeaders();
//        headers.set("Authorization", "KakaoAK " + kakaoApiKey); // 헤더에 권한 키설정
//
//        String url = KAKAO_API_URL + "?query=" + keyword + "&size=3";
//
//        HttpEntity<?> entity = new HttpEntity<>(headers);
//
//        try {
//            ResponseEntity<KakaoSearchResponse> response =
//                    restTemplate.exchange(url, HttpMethod.GET, entity, KakaoSearchResponse.class); // 응답을 response로 변경하여 받음
//            return response.getBody();
//        } catch (Exception e) {
//            log.error("Error in searchByKeyword: ", e);
//            return null;
//        }
//    }

    private Set<String> searchNearbyPlaces(double x, double y) {
        Set<String> nearbyPlaces = new HashSet<>();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + kakaoApiKey);

        // 반경 5km 내 검색
        String url = KAKAO_API_URL + "?x=" + x + "&y=" + y + "&radius=5000";

        HttpEntity<?> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<KakaoSearchResponse> response =
                    restTemplate.exchange(url, HttpMethod.GET, entity, KakaoSearchResponse.class);

            if (response.getBody() != null && response.getBody().getDocuments() != null) {
                response.getBody().getDocuments().forEach(place -> {
                    nearbyPlaces.add(place.getPlaceName());
                });
            }
        } catch (Exception e) {
            log.error("Error in searchNearbyPlaces: ", e);
        }

        return nearbyPlaces;
    }


    private String getCategoryCode(String category) {
        // 카카오 API 카테고리 코드 매핑
        Map<String, String> categoryCodes = Map.of(
                "음식점", "FD6",
                "카페", "CE7",
                "관광명소", "AT4",
                "문화시설", "CT1",
                "숙박", "AD5"
        );

        return categoryCodes.getOrDefault(category, "");
    }
}
