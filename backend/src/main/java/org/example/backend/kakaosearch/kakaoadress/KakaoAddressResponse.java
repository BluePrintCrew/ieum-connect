package org.example.backend.kakaosearch.kakaoadress;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;

import java.util.List;

@Getter
@JsonIgnoreProperties(ignoreUnknown = true)
public class KakaoAddressResponse {
    private List<KakaoAddressDocument> documents;
    private KakaoMeta meta;
}
