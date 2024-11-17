package org.example.backend.service;

import org.apache.commons.imaging.ImageReadException;
import org.example.backend.domain.*;
import org.example.backend.dto.PhotoInfoDTO;
import org.example.backend.dto.ResponseStoryDto;
import org.example.backend.kakaosearch.kakaoadress.AddressResponse;
import org.example.backend.kakaosearch.kakaoadress.KakaoAddressService;
import org.example.backend.repository.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;


@Service
public class StoryService {
    private final StoryRepository storyRepository;
    private final RouteRepository routeRepository;
    private final RoutePointRepository routePointRepository;
    private final PhotoRepository photoRepository;
    private final HashtagRepository hashtagRepository;
    private final PhotoService photoService;
    private final KakaoAddressService kakaoAddressService; // 주소 생성

    public StoryService(StoryRepository storyRepository, RouteRepository routeRepository,
                        RoutePointRepository routePointRepository, PhotoRepository photoRepository,
                        HashtagRepository hashtagRepository, PhotoService photoService,KakaoAddressService kakaoAddressService) {
        this.storyRepository = storyRepository;
        this.routeRepository = routeRepository;
        this.routePointRepository = routePointRepository;
        this.photoRepository = photoRepository;
        this.hashtagRepository = hashtagRepository;
        this.photoService = photoService;
        this.kakaoAddressService = kakaoAddressService;
    }

    @Transactional
    public List<Story> getStoryByUserId(Long memberId) {
            return storyRepository.findByUserUserId(memberId);
    }

    @Transactional(readOnly = true)
    public Page<Story> getStoriesByLikes(Pageable pageable) {
        return storyRepository.findByVisibilityOrderByLikeCountDesc(Story.Visibility.PUBLIC,pageable);
    }

    @Transactional
    public Story getStoryById(Long id) {
            return storyRepository.findByStoryId(id);
    }


    @Transactional
    public Page<Story> findStoriesByHashtag(String hashtagName, Pageable pageable){
        return storyRepository.findByRouteHashtagsNameContainingIgnoreCaseAndVisibility(hashtagName,Story.Visibility.PUBLIC,pageable);
    }
    // 선호도 추가는 추후에 진행
    @Transactional
    public Story createStory(User user, String title, String memo, int preference, Story.Visibility visibility, List<String> hashtags, List<ResponseStoryDto.RoutePointDTO> routePointDTOS, List<MultipartFile> images) throws IOException {
        Story story = new Story();
        story.setUser(user);
        story.setTitle(title);
        story.setDescription(memo);
        story.setVisibility(visibility);
        story.setPreference(preference);

        story = storyRepository.save(story);

        Route route = new Route();
        route.setName(title);

        // 양방향 연관관계 설정
        story.setRoute(route);
        route.setStory(story);

        // 4. Routepoints 생성
//        List<RoutePoint> routePoints = createRoutePoints(routePointDTOS, route);
//        route.setRoutePoints(routePoints);
        //route.getRoutePoints().addAll(routePoints);

        List<RoutePoint> routePoints = new ArrayList<>();
        for (ResponseStoryDto.RoutePointDTO routePointDTO : routePointDTOS) {
            RoutePoint routePoint = new RoutePoint();
            AddressResponse addressResponse = kakaoAddressService.coordToAddress(
                    routePointDTO.getLatitude().doubleValue(),
                    routePointDTO.getLongitude().doubleValue()
            );
            routePoint.setLatitude(routePointDTO.getLatitude());
            routePoint.setLongitude(routePointDTO.getLongitude());
            routePoint.setOrderNum(routePointDTO.getOrderNum());
            routePoint.setAddress(addressResponse.getAddress());
            routePoint.setRoadAddress(addressResponse.getRoadAddress());
            routePoint.setRoute(route);
            routePoints.add(routePoint);
        }
        route.setRoutePoints(routePoints);

        if (images != null && !images.isEmpty()) {
            List<Photo> photos = createPhotos(images, story);

            story.setPhotos(photos);
        }

        List<Hashtag> hashtagEntities = createHashtags(hashtags);
        route.getHashtags().addAll(hashtagEntities);

        return storyRepository.save(story);
    }

    @Transactional(readOnly = true)
    public Page<Story> getStoriesByTime(Pageable pageable) {
        return storyRepository.findByVisibilityOrderByCreatedAtDesc(Story.Visibility.PUBLIC,pageable);
    }

    @Transactional
    public Story updateStory(Long storyId, ResponseStoryDto.UpdateStoryRequest request) {
        Story byStoryId = storyRepository.findByStoryId(storyId);
        byStoryId.setTitle(request.getTitle());
        byStoryId.setDescription(request.getDescription());
        byStoryId.setVisibility(request.getVisibility());

        storyRepository.save(byStoryId);

        return byStoryId; // default를 private로 일단 두는게 좋을 것 같다.
    }


//    private List<RoutePoint> createRoutePoints(List<ResponseStoryDto.RoutePointDTO> routePointDTOS, Route route) throws IOException {
//
//        List<RoutePoint> routePoints = new ArrayList<>();
//        for (ResponseStoryDto.RoutePointDTO routePointDTO : routePointDTOS) {
//            RoutePoint routePoint = new RoutePoint();
//            AddressResponse addressResponse = kakaoAddressService.coordToAddress(
//                    routePointDTO.getLatitude().doubleValue(),
//                    routePointDTO.getLongitude().doubleValue()
//            );
//
//            routePoint.setLatitude(routePointDTO.getLatitude());
//            routePoint.setLongitude(routePointDTO.getLongitude());
//            routePoint.setOrderNum(routePointDTO.getOrderNum());
//            routePoint.setAddress(addressResponse.getAddress());
//            routePoint.setRoadAddress(addressResponse.getRoadAddress());
//            routePoint.setRoute(route);
//            routePoints.add(routePoint);
//        }
//
//        return routePointRepository.saveAll(routePoints);
//    }

    private List<Photo> createPhotos(List<MultipartFile> images, Story story) throws IOException {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("'['yyyy:MM:dd HH:mm:ss']'");

        List<Photo> photos = images.stream()
                .map(image -> {
                    try {
                        PhotoInfoDTO photoInfoDTO = photoService.extractMetadata(image);
                        Photo photo = new Photo();
                        photo.setStory(story);
                        photo.setFilePath(saveImageFile(image));
                        // 커스텀 포맷터 사용
                        photo.setTakenAt(LocalDateTime.parse(photoInfoDTO.getTakenAt(), formatter));
                        photo.setLatitude(photoInfoDTO.getLatitude());
                        photo.setLongitude(photoInfoDTO.getLongitude());
                        return photo;
                    } catch (IOException | ImageReadException e) {
                        throw new RuntimeException("이미지 처리 실패: " + e.getMessage(), e);
                    }
                })
                .collect(Collectors.toList());
        return photoRepository.saveAll(photos);
    }

    private List<Hashtag> createHashtags(List<String> hashtags) {
        return hashtags.stream()
                .map(tag -> {
                    Hashtag hashtag = hashtagRepository.findByName(tag);
                    if (hashtag == null) {
                        hashtag = new Hashtag();
                        hashtag.setName(tag);
                        hashtag = hashtagRepository.save(hashtag);
                    }
                    return hashtag;
                })
                .collect(Collectors.toList());
    }

    private String saveImageFile(MultipartFile file) {
        // Implement file saving logic and return the file path
        // This is just a placeholder
        return "C:\\Users\\guswp\\Desktop\\ieum-connect-photo" + file.getOriginalFilename();
    }

    public void deleteStory(Long storyId) {
        Story byStoryId = storyRepository.findByStoryId(storyId);
        storyRepository.delete(byStoryId);
    }
}
