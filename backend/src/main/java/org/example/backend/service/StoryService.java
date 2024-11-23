package org.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
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

import java.io.File;
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
    private final FollowService followService;
    private final KakaoAddressService kakaoAddressService; // 주소 생성
    @Value("${upload.path}")
    private String uploadPath;
    public StoryService(StoryRepository storyRepository, RouteRepository routeRepository,
                        RoutePointRepository routePointRepository, PhotoRepository photoRepository,
                        HashtagRepository hashtagRepository, PhotoService photoService,
                        KakaoAddressService kakaoAddressService,FollowService followService
                        ) {
        this.storyRepository = storyRepository;
        this.routeRepository = routeRepository;
        this.routePointRepository = routePointRepository;
        this.photoRepository = photoRepository;
        this.hashtagRepository = hashtagRepository;
        this.photoService = photoService;
        this.kakaoAddressService = kakaoAddressService;
        this.followService = followService;
    }

    @Transactional
    public List<Story> getStoryByUserId(Long memberId) {
        return storyRepository.findByUserUserIdAndPlanState(memberId, Story.PlanState.PUBLISH);
    }

    @Transactional(readOnly = true)
    public Page<Story> getStoriesByLikes(Pageable pageable) {
        return storyRepository.findByVisibilityAndPlanStateOrderByLikeCountDesc(
                Story.Visibility.PUBLIC,
                Story.PlanState.PUBLISH,
                pageable
        );
    }

    @Transactional
    public Story getStoryById(Long id) {
            return storyRepository.findByStoryId(id);
    }


    @Transactional
    public Page<Story> findStoriesByHashtag(String hashtagName, Pageable pageable){
        return storyRepository.findByRouteHashtagsNameContainingIgnoreCaseAndVisibilityAndPlanState(
                hashtagName,
                Story.Visibility.PUBLIC,
                Story.PlanState.PUBLISH,
                pageable
        );
        }
    // 사진 두개 이상 넣기 위한 발버둥
    @Transactional
    public Story createStoryInfo(User user, String title, String memo, int preference,
                                 Story.Visibility visibility, List<String> hashtags,
                                 List<ResponseStoryDto.RoutePointDTO> routePointDTOS,
                                Story.PlanState planState) throws IOException {
        Story story = new Story();
        story.setUser(user);
        story.setTitle(title);
        story.setDescription(memo);
        story.setVisibility(visibility);
        story.setPreference(preference);
        story.setPlanState(planState);

        story = storyRepository.save(story);

        Route route = new Route();
        route.setName(title);

        story.setRoute(route);
        route.setStory(story);

        // RoutePoints 생성
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

        List<Hashtag> hashtagEntities = createHashtags(hashtags);
        route.getHashtags().addAll(hashtagEntities);

        return storyRepository.save(story);
    }
    @Transactional
    public Photo addStoryImage(Long storyId, MultipartFile image) throws IOException, ImageReadException {
        Story story = storyRepository.findByStoryId(storyId);
        if (story == null) {
            throw new RuntimeException("Story not found with id: " + storyId);
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("'['yyyy:MM:dd HH:mm:ss']'");

        PhotoInfoDTO photoInfoDTO = photoService.extractMetadata(image);
        Photo photo = new Photo();
        photo.setStory(story);
        photo.setFilePath(saveImageFile(image));
        photo.setTakenAt(LocalDateTime.parse(photoInfoDTO.getTakenAt(), formatter));
        photo.setLatitude(photoInfoDTO.getLatitude());
        photo.setLongitude(photoInfoDTO.getLongitude());

        return photoRepository.save(photo);
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
        return storyRepository.findByVisibilityAndPlanStateOrderByCreatedAtDesc(
                Story.Visibility.PUBLIC,
                Story.PlanState.PUBLISH,
                pageable
        );
    }

    @Transactional
    public Story updateStory(Long storyId, ResponseStoryDto.UpdateStoryRequest request) {
        Story byStoryId = storyRepository.findByStoryId(storyId);
        byStoryId.setTitle(request.getTitle());
        byStoryId.setDescription(request.getDescription());
        byStoryId.setVisibility(request.getVisibility());
        byStoryId.setPreference(request.getPreference());
        byStoryId.setPlanState(request.getPlanState());

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

    private String saveImageFile(MultipartFile file) throws IOException {




        String fileName = file.getOriginalFilename();
        String filePath = uploadPath + File.separator + fileName;

        try {
            // 파일 저장
            File dest = new File(filePath);

            // 같은 이름의 파일이 있을 경우 처리
            if (dest.exists()) {
                String fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
                String extension = fileName.substring(fileName.lastIndexOf('.'));
                fileName = fileNameWithoutExt + "_" + System.currentTimeMillis() + extension;
                filePath = uploadPath + File.separator + fileName;
                dest = new File(filePath);
            }

            file.transferTo(dest);

            return filePath;
        } catch (IOException e) {
            throw new IOException("Failed to save file: " + fileName, e);
        }
    }

    public void deleteStory(Long storyId) {
        Story byStoryId = storyRepository.findByStoryId(storyId);
        storyRepository.delete(byStoryId);
    }

    @Transactional(readOnly = true)
    public Page<Story> getStoriesByPlanState(Story.PlanState planState, Pageable pageable) {
        return storyRepository.findByPlanState(planState, pageable);
    }

    @Transactional
    public List<Story> getPlannedStoriesByUserId(Long userId) {
        return storyRepository.findByUserUserIdAndPlanState(userId, Story.PlanState.PLANNED);
    }

}
