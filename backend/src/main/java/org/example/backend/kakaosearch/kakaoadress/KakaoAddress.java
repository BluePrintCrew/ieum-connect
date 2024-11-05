package org.example.backend.kakaosearch.kakaoadress;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
@JsonIgnoreProperties(ignoreUnknown = true)
public class KakaoAddress {
    @JsonProperty("address_name")
    private String addressName;

    private String region1depthName;  // 시도
    private String region2depthName;  // 구
    private String region3depthName;  // 동
}
