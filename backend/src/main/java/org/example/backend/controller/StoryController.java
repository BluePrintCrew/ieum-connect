package org.example.backend.controller;

import org.example.backend.domain.Story;
import org.example.backend.domain.User;
import org.example.backend.dto.ResponseStoryDto;
import org.example.backend.dto.StoryDTO;
import org.example.backend.service.StoryService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stories")
public class StoryController {

    private final StoryService storyService;

    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }



        @GetMapping("/member/{memberId}")
        public ResponseEntity<List<StoryDTO.Response>> getStoriesByUserId(@PathVariable("userId") Long userId) {
            try {
                // 각 story에 대한 list를 받아옴
                List<Story> stories = storyService.getStoryByUserId(userId);

                // empty이 시 에러 반환
                if (stories.isEmpty()) {
                    return ResponseEntity.noContent().build();
                }

                // 프론트엔드에 전달해야할 response
                List<StoryDTO.Response> storyDTOs = stories.stream()
                        .map(this::convertToDTO) // 해당 도메인 객체들을 DTo 형식을 변환
                        .collect(Collectors.toList());

                return ResponseEntity.ok(storyDTOs);
            } catch (Exception e) {
                return ResponseEntity.badRequest().build();
            }
        }

        private StoryDTO.Response convertToDTO(Story story) {
            StoryDTO.Response dto = new StoryDTO.Response();
            dto.setStoryId(story.getStoryId());
            dto.setTitle(story.getTitle());
            dto.setDescription(story.getDescription());
            dto.setCreatedAt(story.getCreatedAt());
            dto.setVisibility(story.getVisibility().toString());

            // User 정보 설정
            StoryDTO.UserDTO userDTO = new StoryDTO.UserDTO();
            userDTO.setUserId(story.getUser().getUserId());
            userDTO.setUsername(story.getUser().getUsername());
            dto.setUser(userDTO);

            // Route 정보 설정
            StoryDTO.RouteDTO routeDTO = new StoryDTO.RouteDTO();
            routeDTO.setRouteId(story.getRoute().getRouteId());
            routeDTO.setName(story.getRoute().getName());

            // 해당 루트에 연관되는 routePotnt들을 반환받아 이를 DTO 배열로 설정
            List<StoryDTO.RoutePointDTO> routePointDTOs = story.getRoute().getRoutePoints().stream()
                    .map(rp -> new StoryDTO.RoutePointDTO(rp.getRoutePointId(), rp.getLatitude(), rp.getLongitude(), rp.getOrderNum()))
                    .collect(Collectors.toList());
            routeDTO.setRoutePoints(routePointDTOs);

            dto.setRoute(routeDTO);

            // Photo 정보 설정
            List<StoryDTO.PhotoDTO> photoDTOs = story.getPhotos().stream()
                    .map(p -> new StoryDTO.PhotoDTO(p.getPhotoId(), p.getFilePath(), p.getTakenAt(), p.getLatitude(), p.getLongitude()))
                    .collect(Collectors.toList());
            dto.setPhotos(photoDTOs);

            // Hashtag 정보 설정
            List<String> hashtagNames = story.getRoute().getHashtags().stream()
                    .map(h -> h.getName())
                    .collect(Collectors.toList());
            dto.setHashtags(hashtagNames);

            return dto;
        }

        // 기타 필요한 메소드들...



//    @GetMapping("/member/{memberId}")
//    public ResponseEntity<?> getStoriesByUserId(@PathVariable("userId") Long userId) {
//        try {
//            List<Story> stories = storyService.getStoryByUserId(userId);
//
//            if (stories.isEmpty()) {
//                return ResponseEntity.noContent().build(); //
//            }
//
//            // 여기서 Story 엔티티를 DTO로 변환하는 로직을 추가할 수 있습니다.
//            return ResponseEntity.ok(stories);
//        } catch (Exception e) {
//            ResponseStoryDto.ErrorResponse errorResponse = new ResponseStoryDto.ErrorResponse();
//            errorResponse.setStatus("error");
//            errorResponse.setMessage("스토리 조회 중 오류가 발생했습니다: " + e.getMessage());
//            return ResponseEntity.badRequest().body(errorResponse);
//        }
//    }
    //json 과 image 파일을 따로 생성해서 받게 된다.
    // @RequestPart는 여러가지 , 데이터 타입을 한번에 보내는 요청을 받을 때 분리 할 수 있도록 한다.
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createStory(
            @RequestPart("storyInfo") ResponseStoryDto.CreateStoryRequest request,
            @RequestPart("images") List<MultipartFile> images) {
        try {
            // 추후 user 로그인 개발하면됨.
            User tempUser = new User();
            tempUser.setUserId(1L);

            Story savedStory = storyService.createStory(tempUser, request.getTitle(), request.getMemo(),
                    request.getPreference(), request.getHashtags(), images);

            ResponseStoryDto.CreateStoryResponse response = new ResponseStoryDto.CreateStoryResponse();
            response.setStatus("success");
            response.setMessage("스토리가 성공적으로 저장되었습니다.");
            response.setSavedStoryId(savedStory.getStoryId());
            response.setCreatedAt(ZonedDateTime.now());

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            ResponseStoryDto.ErrorResponse errorResponse = new ResponseStoryDto.ErrorResponse();
            errorResponse.setStatus("error");
            errorResponse.setMessage("스토리 저장 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}