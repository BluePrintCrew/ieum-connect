package org.example.backend.service;

import org.apache.commons.imaging.ImageReadException;
import org.example.backend.domain.*;
import org.example.backend.dto.PhotoInfoDTO;
import org.example.backend.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
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

    public StoryService(StoryRepository storyRepository, RouteRepository routeRepository,
                        RoutePointRepository routePointRepository, PhotoRepository photoRepository,
                        HashtagRepository hashtagRepository, PhotoService photoService) {
        this.storyRepository = storyRepository;
        this.routeRepository = routeRepository;
        this.routePointRepository = routePointRepository;
        this.photoRepository = photoRepository;
        this.hashtagRepository = hashtagRepository;
        this.photoService = photoService;

    }

    // 선호도 추가는 추후에 진행
    @Transactional
    public Story createStory(User user, String title, String memo, int preference, List<String> hashtags, List<MultipartFile> images) throws IOException {
        Story story = new Story();
        story.setUser(user);
        story.setTitle(title);
        story.setDescription(memo);
        story.setVisibility(Story.Visibility.PRIVATE); // default를 private로 일단 두는게 좋을 것 같다.

        Route route = new Route();
        route.setName(title);
        route.setStory(story);
        story.setRoute(route); // 여기서 story route설정.

        List<RoutePoint> routePoints = createRoutePoints(images, route); // 해당 받아온 images로 저장.
        route.setRoutePoints(routePoints); // route가 갖는 루트 포인트들

        List<Photo> photos = createPhotos(images, story); // 각 image 들을 정리하고 이들을 스토리에 투기
        story.setPhotos(photos);

        List<Hashtag> hashtagEntities = createHashtags(hashtags); // 각 달린 해시 테그들을 설정.
        route.setHashtags(hashtagEntities);

        story = storyRepository.save(story);
        return story;
    }


    private List<RoutePoint> createRoutePoints(List<MultipartFile> images, Route route) throws IOException {
        List<PhotoInfoDTO> photoInfoList = images.stream()
                .map(image -> {
                    try {
                        return photoService.extractMetadata(image);
                    } catch (IOException | ImageReadException e) {
                        throw new RuntimeException("이미지 메타데이터 추출 실패", e);
                    }
                })
                .sorted(Comparator.comparing(PhotoInfoDTO::getTakenAt))
                .collect(Collectors.toList());

        List<RoutePoint> routePoints = IntStream.range(0, photoInfoList.size())
                .mapToObj(i -> {
                    PhotoInfoDTO photoInfo = photoInfoList.get(i);
                    RoutePoint point = new RoutePoint();
                    point.setRoute(route);
                    point.setLatitude(photoInfo.getLatitude());
                    point.setLongitude(photoInfo.getLongitude());
                    point.setOrderNum(i);
                    return point;
                })
                .collect(Collectors.toList());

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
}
