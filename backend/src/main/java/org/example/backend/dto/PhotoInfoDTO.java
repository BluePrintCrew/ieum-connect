package org.example.backend.dto;

import lombok.*;
import org.apache.commons.imaging.ImageReadException;
import org.example.backend.domain.Photo;
import org.example.backend.service.PhotoService;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
public class PhotoInfoDTO {
    // 파일 이름
    //ex "이현제.jpeg
    private String fileName;
    // 위도
    private BigDecimal latitude;
    // 경도
    private BigDecimal longitude;
    // 촬영시간
    private String takenAt;
    //사진 순서

    private int orderNum = 0;


    static public List<PhotoInfoDTO> createPhotoInfoDTOList( List<MultipartFile> photos) throws IOException, ImageReadException {
        List<PhotoInfoDTO> photoInfoList = new ArrayList<>();

        for (MultipartFile photo : photos) {
            PhotoInfoDTO photoInfo = PhotoService.extractMetadata(photo);
            if (photoInfo != null) {
                photoInfoList.add(photoInfo);
            }
        }

        // 촬영 시간순으로 정렬
        photoInfoList.sort(Comparator.comparing(PhotoInfoDTO::getTakenAt));

        for(int i = 0; i < photoInfoList.size(); i++) {
            photoInfoList.get(i).setOrderNum(i);
        }
        return photoInfoList;

    }
}

