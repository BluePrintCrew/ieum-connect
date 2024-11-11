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
        return storyRepository.findAllByOrderByLikeCountDesc(pageable);
    }

    @Transactional
    public Story getStoryById(Long id) {
            return storyRepository.findByStoryId(id);
    }


    @Transactional
    public Page<Story> findStoriesByHashtag(String hashtagName, Pageable pageable){
        return storyRepository.findByRouteHashtagsNameContainingIgnoreCase(hashtagName,pageable);
    }
    // 선호도 추가는 추후에 진행
    @Transactional
    public Story createStory(User user, String title, String memo, int preference, List<String> hashtags, List<ResponseStoryDto.RoutePointDTO> routePointDTOS, List<MultipartFile> images) throws IOException {
        Story story = new Story();
        story.setUser(user);
        story.setTitle(title);
        story.setDescription(memo);
        story.setVisibility(Story.Visibility.PRIVATE); // default를 private로 일단 두는게 좋을 것 같다.

        Route route = new Route();
        route.setName(title);
        route.setStory(story);
        story.setRoute(route); // 여기서 story route설정.

        List<RoutePoint> routePoints = createRoutePoints(routePointDTOS, route); // routePoint로 저장
        route.setRoutePoints(routePoints); // route가 갖는 루트 포인트들

        List<Photo> photos = createPhotos(images, story); // 각 image 들을 정리하고 이들을 스토리에 투기
        story.setPhotos(photos);

        List<Hashtag> hashtagEntities = createHashtags(hashtags); // 각 달린 해시 테그들을 설정.
        route.setHashtags(hashtagEntities);

        story = storyRepository.save(story);
        return story;
    }

    @Transactional(readOnly = true)
    public Page<Story> getStoriesByTime(Pageable pageable) {
        return storyRepository.findAllByOrderByCreatedAtDesc(pageable);
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


    private List<RoutePoint> createRoutePoints(List<ResponseStoryDto.RoutePointDTO> routePointDTOS, Route route) throws IOException {

        List<RoutePoint> routePoints = new ArrayList<>();
        for (ResponseStoryDto.RoutePointDTO routePointDTO : routePointDTOS) {
            RoutePoint routePoint = new RoutePoint();
            AddressResponse addressResponse = kakaoAddressService.coordToAddress(routePointDTO.getLatitude().doubleValue(), routePointDTO.getLongitude().doubleValue());
            routePoint.setLatitude(routePointDTO.getLatitude());
            routePoint.setLongitude(routePointDTO.getLongitude());
            routePoint.setOrderNum(routePointDTO.getOrderNum());
            routePoint.setAddress(addressResponse.getAddress());
            routePoint.setRoadAddress(addressResponse.getRoadAddress());
            routePoint.setRoute(route);
            routePoints.add(routePoint);
        }

        return routePointRepository.saveAll(routePoints);
    }

    private List<Photo> createPhotos(List<MultipartFile> images, Story story) throws IOException {
        List<Photo> photos = images.stream()
                .map(image -> {
                    try {
                        PhotoInfoDTO photoInfoDTO = photoService.extractMetadata(image);
                        Photo photo = new Photo();
                        photo.setStory(story);
                        photo.setFilePath(saveImageFile(image)); // Implement this method to save the file and return the path
                        photo.setTakenAt(LocalDateTime.parse(photoInfoDTO.getTakenAt()));
                        photo.setLatitude(photoInfoDTO.getLatitude());
                        photo.setLongitude(photoInfoDTO.getLongitude());
                        return photo;
                    } catch (IOException | ImageReadException e) {
                        throw new RuntimeException("이미지 처리 실패" + e);
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
