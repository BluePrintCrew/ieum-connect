package org.example.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.domain.Hashtag;
import org.example.backend.domain.Story;
import org.example.backend.domain.User;
import org.example.backend.dto.ResponseStoryDto;
import org.example.backend.dto.StoryDTO;
import org.example.backend.kakaosearch.KakaoKeywordService;
import org.example.backend.service.StoryService;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/stories")
@Tag(name = "Story CRUD 로직" , description = "조회는 회원, 해시테그검색으로 조회")
public class StoryController {

    private final StoryService storyService;
    private final KakaoKeywordService kakaoKeywordService;

    public StoryController(StoryService storyService, KakaoKeywordService kakaoKeywordService) {
        this.storyService = storyService;
        this.kakaoKeywordService = kakaoKeywordService;
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
                    request.getPreference(), request.getVisibility(),request.getHashtags(),request.getRoutePoints(), images);

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
    @Operation(summary = "story id를 통한 조회, 사용자가 게시글을 눌렀을때!")
    public ResponseEntity<StoryDTO.Response> getStory(@PathVariable Long storyId) {
        Story story = storyService.getStoryById(storyId);
        if (story == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(convertToDTO(story));
    }

    @GetMapping("/member/{userId}")
    @Operation(summary = "userId를 통한 모든스토리 조회", description = "마이페이지에서 자신의 스토리 조회 !! 이미지 없음 !!")
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

//    @Operation(summary = "storyID 에 해당하는 image 조회")
//    @GetMapping("/{storyId}/images")
//    public ResponseEntity<List<StoryDTO.PhotoDTO>> getStoryImages(@PathVariable("storyId") Long storyId) {
//        Story story = storyService.getStoryById(storyId);
//        if (story == null) {
//            return ResponseEntity.notFound().build();
//        }
//        List<StoryDTO.PhotoDTO> photoDTOs = story.getPhotos().stream()
//                .map(p -> new StoryDTO.PhotoDTO(p.getPhotoId(), p.getFilePath(), p.getTakenAt(), p.getLatitude(), p.getLongitude()))
//                .collect(Collectors.toList());
//        return ResponseEntity.ok(photoDTOs);
//    }

    @PreAuthorize("permitAll()")
    @GetMapping("/search")
    @Operation(summary = "해시태그 이름으로 조회",
            description = "페이징 처리된 스토리 목록 반환. 직접 검색 결과가 없을 경우 연관 키워드로 검색")
    public ResponseEntity<Page<StoryDTO.Response>> searchStoriesByHashtag(
            @RequestParam("hashtag") String hashtagName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {


        log.info("Search request received - hashtag: {}", hashtagName); // 컨트롤러 진입 로그

        // 정렬 필드 유효성 검사
        StorySortField sortField = StorySortField.fromString(sort);
        log.info("Sort field: {}, direction: {}", sortField, direction);
        // 정렬 방향 설정
        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ?
                Sort.Direction.ASC : Sort.Direction.DESC;

        // 정렬 조건 설정
        Sort sorting = Sort.by(sortDirection, sortField.getFieldName()); // 정렬 조건 설정

        // 추가 정렬 조건
        if (sortField != StorySortField.CREATED_AT) {
            sorting = sorting.and(Sort.by(Sort.Direction.DESC, "createdAt"));
        }

        Pageable pageable = PageRequest.of(page, size, sorting); // 정렬 조건, 페이지, 사이즈에 대해서 설정

        // 1. 직접 해시태그로 검색
        Page<Story> stories = storyService.findStoriesByHashtag(hashtagName, pageable); // 해당 pageable을 통해서 정렬된 결과물 추출
        log.info("Direct search results size: {}", stories.getContent().size());
        // 2. 검색 결과가 없을 경우 카카오 API로 연관 키워드 검색
        if (stories.isEmpty()) {
            List<Story> relatedStories = new ArrayList<>();
            log.info("No direct results found, searching related keywords");
            // 카카오 API로 연관 키워드 가져오기
            List<String> relatedKeywords = kakaoKeywordService.searchByKeywords(hashtagName);
            log.info("Related keywords found: {}", relatedKeywords);
            // 각 연관 키워드로 검색
            for (String relatedKeyword : relatedKeywords) {
                Page<Story> relatedResults = storyService.findStoriesByHashtag(
                        relatedKeyword,
                        PageRequest.of(0, pageable.getPageSize(), sorting)
                );
                relatedStories.addAll(relatedResults.getContent());
            }

            // 중복 제거
            List<Story> uniqueStories = relatedStories.stream()
                    .distinct()
                    .collect(Collectors.toList());

            // 페이징 처리
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), uniqueStories.size());

            // 결과가 있는 경우에만 서브리스트 생성
            if (!uniqueStories.isEmpty() && start < uniqueStories.size()) {
                Page<Story> relatedStoriesPage = new PageImpl<>(
                        uniqueStories.subList(start, end),
                        pageable,
                        uniqueStories.size()
                );

                // Story를 DTO로 변환
                return ResponseEntity.ok(relatedStoriesPage.map(this::convertToDTOWithoutImages));
            }
        }

        // 직접 검색 결과가 있거나, 연관 검색 결과도 없는 경우
        Page<StoryDTO.Response> storyDTOs = stories.map(this::convertToDTOWithoutImages);

        return storyDTOs.isEmpty() ?
                ResponseEntity.noContent().build() :
                ResponseEntity.ok(storyDTOs);
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



    @GetMapping("/top")
    @Operation(summary = "좋아요 순으로 스토리 조회",
            description = "페이징 처리된 스토리 목록을 좋아요 수 기준으로 내림차순 정렬하여 반환")
    public ResponseEntity<Page<StoryDTO.Response>> getTopStories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Story> stories = storyService.getStoriesByLikes(pageable);
        Page<StoryDTO.Response> storyDTOs = stories.map(this::convertToDTO);

        return storyDTOs.isEmpty() ?
                ResponseEntity.noContent().build() :
                ResponseEntity.ok(storyDTOs);
    }

    @GetMapping("/recent")
    @Operation(summary = "최신 스토리 조회",
            description = "페이징 처리된 스토리 목록을 생성 시간 기준으로 내림차순 정렬하여 반환")
    public ResponseEntity<Page<StoryDTO.Response>> getRecentStories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Story> stories = storyService.getStoriesByTime(pageable);
        Page<StoryDTO.Response> storyDTOs = stories.map(this::convertToDTO);

        return storyDTOs.isEmpty() ?
                ResponseEntity.noContent().build() :
                ResponseEntity.ok(storyDTOs);
    }
    // 이미지가 없는 response dto
    private StoryDTO.Response convertToDTOWithoutImages(Story story) {
        StoryDTO.Response dto = new StoryDTO.Response();
        // Set basic story information
        dto.setStoryId(story.getStoryId());
        dto.setTitle(story.getTitle());
        dto.setDescription(story.getDescription());
        dto.setCreatedAt(story.getCreatedAt());
        dto.setVisibility(story.getVisibility());

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
                .map(rp -> new StoryDTO.RoutePointDTO(rp.getRoutePointId(), rp.getLatitude(), rp.getLongitude(), rp.getOrderNum(), rp.getAddress(), rp.getRoadAddress()))
                .collect(Collectors.toList());
        routeDTO.setRoutePoints(routePointDTOs);

        dto.setRoute(routeDTO);

        // Set hashtags
        List<String> hashtagNames = story.getRoute().getHashtags().stream()
                .map(Hashtag::getName)
                .collect(Collectors.toList());
        dto.setHashtags(hashtagNames);


        dto.setPhotoCount(story.getPhotos().size());
        // 좋아요 count
        dto.setLikeCount(story.getLikeCount()); // like count

        return dto;
    }

        private StoryDTO.Response convertToDTO(Story story) {
            StoryDTO.Response dto = new StoryDTO.Response();
            dto.setStoryId(story.getStoryId());
            dto.setTitle(story.getTitle());
            dto.setDescription(story.getDescription());
            dto.setCreatedAt(story.getCreatedAt());
            dto.setVisibility(story.getVisibility());

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
                    .map(rp -> new StoryDTO.RoutePointDTO(rp.getRoutePointId(), rp.getLatitude(), rp.getLongitude(), rp.getOrderNum(), rp.getAddress(), rp.getRoadAddress()))
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

            // 좋아요 수 설정
            dto.setLikeCount(story.getLikeCount());

            // 댓글 정보 설정
            List<StoryDTO.CommentDTO> commentDTOs = story.getComments().stream()
                    .map(comment -> {
                        StoryDTO.CommentDTO commentDTO = new StoryDTO.CommentDTO();
                        commentDTO.setCommentId(comment.getId());
                        commentDTO.setContent(comment.getContent());
                        commentDTO.setCreatedAt(comment.getCreatedAt());
                        commentDTO.setUsername(comment.getUser().getUsername()); // 나중에 이부분은 확장.


                        return commentDTO;
                    })
                    .collect(Collectors.toList());
            dto.setComments(commentDTOs);

            return dto;
        }
    public enum StorySortField {
        CREATED_AT("createdAt"),
        LIKES("likeCount");


        private final String fieldName;

        StorySortField(String fieldName) {
            this.fieldName = fieldName;
        }

        public String getFieldName() {
            return fieldName;
        }

        public static StorySortField fromString(String text) {
            for (StorySortField field : StorySortField.values()) {
                if (field.fieldName.equalsIgnoreCase(text)) {
                    return field;
                }
            }
            return CREATED_AT; // 기본값
        }
    }


}