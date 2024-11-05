package org.example.backend.kakaosearch;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
@Getter
@Setter
public class KakaoSearchResponse {
    private List<Document> documents;
    private Meta meta;

    @Getter
    @Setter
    public static class Meta {
        @JsonProperty("is_end")
        private boolean isEnd;

        @JsonProperty("pageable_count")
        private int pageableCount;

        @JsonProperty("total_count")
        private int totalCount;
    }

    @Getter
    @Setter
    public static class Document {
        @JsonProperty("address_name")
        private String addressName;

        @JsonProperty("category_group_code")
        private String categoryGroupCode;

        @JsonProperty("category_group_name")
        private String categoryGroupName;

        @JsonProperty("category_name")
        private String categoryName;

        private String distance;
        private String id;
        private String phone;

        @JsonProperty("place_name")
        private String placeName;

        @JsonProperty("place_url")
        private String placeUrl;

        @JsonProperty("road_address_name")
        private String roadAddressName;

        private String x;  // longitude
        private String y;  // latitude
    }
}