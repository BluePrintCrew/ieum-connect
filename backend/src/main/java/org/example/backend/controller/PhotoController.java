package org.example.backend.controller;

import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
import org.apache.commons.imaging.ImageReadException;
import org.example.backend.dto.PhotoInfoDTO;
import org.example.backend.service.PhotoService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import org.apache.commons.imaging.Imaging;
import org.apache.commons.imaging.common.ImageMetadata;
import org.apache.commons.imaging.formats.jpeg.JpegImageMetadata;
import org.apache.commons.imaging.formats.tiff.TiffImageMetadata;
import org.apache.commons.imaging.formats.tiff.constants.ExifTagConstants;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/photos")
@Tag(name = "사진의 관련 controller ")
public class PhotoController {

    private final PhotoService photoService;

    @Tag(name = "정보 추출 및 전달, 정렬")
    @PostMapping("/upload")
    public List<PhotoInfoDTO> uploadPhotos(@RequestParam("photos") List<MultipartFile> photos) throws IOException, ImageReadException {
        List<PhotoInfoDTO> photoInfoList = new ArrayList<>();

        for (MultipartFile photo : photos) {
            PhotoInfoDTO photoInfo = photoService.extractMetadata(photo);
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

    //메타데이터 추출

}

