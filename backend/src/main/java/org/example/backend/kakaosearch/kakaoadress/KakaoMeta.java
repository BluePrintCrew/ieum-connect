package org.example.backend.kakaosearch.kakaoadress;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
@JsonIgnoreProperties(ignoreUnknown = true)
public class KakaoMeta {
    @JsonProperty("total_count")
    private Integer totalCount;
}
