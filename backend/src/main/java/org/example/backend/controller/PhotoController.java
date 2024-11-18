package org.example.backend.controller;

import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
import org.apache.commons.imaging.ImageReadException;
import org.example.backend.dto.PhotoInfoDTO;
import org.example.backend.service.PhotoService;
import org.example.backend.service.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.TimeUnit;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/photos")
@Tag(name = "Photo upload ", description = "photoid를 통한 사진 조회S")
public class PhotoController {

    private final PhotoService photoService;
    private final Logger log = LoggerFactory.getLogger(PhotoController.class);

    @GetMapping("/{photoId}")
    public ResponseEntity<byte[]> getPhoto(@PathVariable Long photoId) {
        try {
            log.debug("Requesting photo with id: {}", photoId);
            byte[] imageData = photoService.getPhoto(photoId);
            String contentType = photoService.getPhotoContentType(photoId);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS)) // 브라우저 캐싱 설정
                    .body(imageData);
        } catch (ResourceNotFoundException e) {
            log.warn("Photo not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            log.error("Error reading photo file: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

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

