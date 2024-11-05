package org.example.backend.kakaosearch.kakaoadress;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
@JsonIgnoreProperties(ignoreUnknown = true)
public class KakaoRoadAddress {
    @JsonProperty("address_name")
    private String addressName;

    private String roadName;          // 도로명
    private String buildingName;      // 건물명
}
