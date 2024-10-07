package org.example.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import org.example.backend.domain.Hashtag;
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
@Tag(name = "Story CRUD 로직" , description = "조회는 회원, 해시테그검색으로 조회")
public class StoryController {

    private final StoryService storyService;

    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }


    // CREATE
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "스토리 생성", description = "storyinfo, images 라는 두 종류로 묶어야함(MUltipart)")
    public ResponseEntity<?> createStory(
            @RequestPart("storyInfo") ResponseStoryDto.CreateStoryRequest request, // - story info part
            @RequestPart("images") List<MultipartFile> images) { // image 관련 파트
        try {
            // 나중에 실제 유저 인증에 대한 로직이 들어가야함
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
            ResponseStoryDto.ErrorResponse errorResponse = new ResponseStoryDto.ErrorResponse("error", e.getMessage());
            errorResponse.setStatus("error");
            errorResponse.setMessage("스토리 저장 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // READ
    @GetMapping("/{storyId}")
    @Operation(summary = "story id를 통한 조회")
    public ResponseEntity<StoryDTO.Response> getStory(@PathVariable Long storyId) {
        Story story = storyService.getStoryById(storyId);
        if (story == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(convertToDTOWithoutImages(story));
    }
//
//    @GetMapping
//    public ResponseEntity<List<StoryDTO.Response>> getAllStories() { // all story에 관한 로직은 필요 없을 것 같다.
//        List<Story> stories = storyService.getAllStories();
//        if (stories.isEmpty()) {
//            return ResponseEntity.noContent().build();
//        }
//        List<StoryDTO.Response> storyDTOs = stories.stream()
//                .map(this::convertToDTOWithoutImages)
//                .collect(Collectors.toList());
//        return ResponseEntity.ok(storyDTOs);
//    }

    @GetMapping("/member/{userId}")
    @Operation(summary = "userId를 통한 스토리 조회", description = "마이페이지에서 자신의 스토리 조회 !! 이미지 없음 !!")
    public ResponseEntity<List<StoryDTO.Response>> getStoriesByUserId(@PathVariable("userId") Long userId) {
        List<Story> stories = storyService.getStoryByUserId(userId);
        if (stories.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        List<StoryDTO.Response> storyDTOs = stories.stream()
                .map(this::convertToDTOWithoutImages)
                .collect(Collectors.toList());
        return ResponseEntity.ok(storyDTOs);
    }
    @Operation(summary = "storyID 에 해당하는 image 조회")
    @GetMapping("/{storyId}/images")
    public ResponseEntity<List<StoryDTO.PhotoDTO>> getStoryImages(@PathVariable("storyId") Long storyId) {
        Story story = storyService.getStoryById(storyId);
        if (story == null) {
            return ResponseEntity.notFound().build();
        }
        List<StoryDTO.PhotoDTO> photoDTOs = story.getPhotos().stream()
                .map(p -> new StoryDTO.PhotoDTO(p.getPhotoId(), p.getFilePath(), p.getTakenAt(), p.getLatitude(), p.getLongitude()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(photoDTOs);
    }

    @GetMapping("/search")
    @Operation(summary = "해시테그 이름으로 조회", description = "images 없음")
    public ResponseEntity<List<StoryDTO.Response>> searchStoriesByHashtag(@RequestParam("hashtag") String hashtagName) {
        List<Story> stories = storyService.findStoriesByHashtag(hashtagName);
        if (stories.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        List<StoryDTO.Response> storyDTOs = stories.stream()
                .map(this::convertToDTOWithoutImages)
                .collect(Collectors.toList());
        return ResponseEntity.ok(storyDTOs);
    }

    // UPDATE
    @Operation(summary = "업데이트", description = "제목, 설명, 접근성 변경 가능")
    @PutMapping("/{storyId}")
    public ResponseEntity<?> updateStory(@PathVariable Long storyId, @RequestBody ResponseStoryDto.UpdateStoryRequest request) {
        try {
            Story updatedStory = storyService.updateStory(storyId, request);
            return ResponseEntity.ok(convertToDTOWithoutImages(updatedStory));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseStoryDto.ErrorResponse("error", e.getMessage()));
        }
    }

    // DELETE
    @Operation(summary = "스토리 삭제")
    @DeleteMapping("/{storyId}")
    public ResponseEntity<?> deleteStory(@PathVariable Long storyId) {
        try {
            storyService.deleteStory(storyId);
            return ResponseEntity.ok().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseStoryDto.ErrorResponse("error", e.getMessage()));
        }
    }


    private StoryDTO.Response convertToDTOWithoutImages(Story story) {
        StoryDTO.Response dto = new StoryDTO.Response();
        // Set basic story information
        dto.setStoryId(story.getStoryId());
        dto.setTitle(story.getTitle());
        dto.setDescription(story.getDescription());
        dto.setCreatedAt(story.getCreatedAt());
        dto.setVisibility(story.getVisibility().toString());

        // Set user information
        StoryDTO.UserDTO userDTO = new StoryDTO.UserDTO();
        userDTO.setUserId(story.getUser().getUserId());
        userDTO.setUsername(story.getUser().getUsername());
        dto.setUser(userDTO);

        // Set route information
        StoryDTO.RouteDTO routeDTO = new StoryDTO.RouteDTO();
        routeDTO.setRouteId(story.getRoute().getRouteId());
        routeDTO.setName(story.getRoute().getName());

        List<StoryDTO.RoutePointDTO> routePointDTOs = story.getRoute().getRoutePoints().stream()
                .map(rp -> new StoryDTO.RoutePointDTO(rp.getRoutePointId(), rp.getLatitude(), rp.getLongitude(), rp.getOrderNum()))
                .collect(Collectors.toList());
        routeDTO.setRoutePoints(routePointDTOs);

        dto.setRoute(routeDTO);

        // Set hashtags
        List<String> hashtagNames = story.getRoute().getHashtags().stream()
                .map(Hashtag::getName)
                .collect(Collectors.toList());
        dto.setHashtags(hashtagNames);

        // Instead of including full photo information, just include the count
        dto.setPhotoCount(story.getPhotos().size());

        return dto;
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


}