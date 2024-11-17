package org.example.backend.kakaosearch.kakaoadress;

import lombok.*;

@Getter
@Builder
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {
    private String address;       // 지번 주소
    private String roadAddress;   // 도로명 주소
}
