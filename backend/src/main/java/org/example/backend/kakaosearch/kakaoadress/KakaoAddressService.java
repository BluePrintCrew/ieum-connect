package org.example.backend.kakaosearch.kakaoadress;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@Slf4j
@Service
public class KakaoAddressService {

    private static final String KAKAO_COORD_TO_ADDRESS_URL = "https://dapi.kakao.com/v2/local/geo/coord2address";
    private RestTemplate restTemplate;

    @Value("${kakao.api.key}")
    private String kakaoApiKey;

    public KakaoAddressService() {
        this.restTemplate = new RestTemplate();
    }


    /**
     * 좌표를 주소로 변환하는 메서드
     * @param x 경도 (longitude)
     * @param y 위도 (latitude)
     * @return 변환된 주소 정보
     */
    public AddressResponse coordToAddress(double x, double y) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + kakaoApiKey);

        String url = UriComponentsBuilder.fromHttpUrl(KAKAO_COORD_TO_ADDRESS_URL)
                .queryParam("x", x)
                .queryParam("y", y)
                .queryParam("input_coord", "WGS84")  // GPS 좌표계
                .build()
                .toUriString();

        HttpEntity<?> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<KakaoAddressResponse> response =
                    restTemplate.exchange(url, HttpMethod.GET, entity, KakaoAddressResponse.class);

            if (response.getBody() != null &&
                    !response.getBody().getDocuments().isEmpty()) {

                KakaoAddressDocument document = response.getBody().getDocuments().get(0);
                return AddressResponse.builder()
                        .address(document.getAddress().getAddressName())
                        .roadAddress(document.getRoadAddress().getAddressName())
                        .build();
            }

            return AddressResponse.builder()
                    .address("주소를 찾을 수 없습니다.")
                    .roadAddress("도로명 주소를 찾을 수 없습니다.")
                    .build();

        } catch (Exception e) {
            log.error("Error in coordToAddress: ", e);
            throw new AddressNotFoundException("주소 변환 중 오류가 발생했습니다.", e);
        }
    }
}

