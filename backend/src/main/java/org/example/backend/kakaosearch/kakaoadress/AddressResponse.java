package org.example.backend.kakaosearch.kakaoadress;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AddressResponse {
    private String address;       // 지번 주소
    private String roadAddress;   // 도로명 주소
}
