package org.example.backend.controller;



import org.example.backend.config.TestSecurityConfig;
import org.example.backend.kakaosearch.KakaoKeywordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

// JUnit 관련 imports
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

// Mockito 관련 imports
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

// Spring Test 관련 imports
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

// Jackson 관련 import
import com.fasterxml.jackson.databind.ObjectMapper;

// Java 기본 imports
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.backend.domain.*;
import org.example.backend.dto.ResponseStoryDto;
import org.example.backend.service.StoryService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(TestSecurityConfig.class)  // 이 부분을 추가
@WebMvcTest(StoryController.class)
@AutoConfigureMockMvc
class StoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private KakaoKeywordService kakaoKeywordService;  // 추가

    @MockBean
    private StoryService storyService;

    @Autowired
    private ObjectMapper objectMapper;

    private Story createSampleStory() {
        Story story = new Story();
        story.setStoryId(1L);
        story.setTitle("Test Story");
        story.setDescription("Test Description");
        story.setCreatedAt(LocalDateTime.now());
        story.setVisibility(Story.Visibility.PUBLIC);
        story.setLikeCount(10);

        // User 설정
        User user = new User();
        user.setUserId(1L);
        user.setUsername("testUser");
        story.setUser(user);

        // Route 설정
        Route route = new Route();
        route.setRouteId(1L);
        route.setName("Test Route");
        route.setStory(story);
        story.setRoute(route);

        // RoutePoint 설정
        List<RoutePoint> routePoints = new ArrayList<>();
        RoutePoint point = new RoutePoint();
        point.setRoutePointId(1L);
        point.setLatitude(new BigDecimal("37.5665"));
        point.setLongitude(new BigDecimal("126.9780"));
        point.setRoadAddress("테스트 도로명1");
        point.setAddress("테스트 지번명1");
        point.setOrderNum(1);
        point.setRoute(route);
        routePoints.add(point);
        route.setRoutePoints(routePoints);

        // Photo 설정
        List<Photo> photos = new ArrayList<>();
        Photo photo = new Photo();
        photo.setPhotoId(1L);
        photo.setFilePath("/test/path/image.jpg");
        photo.setTakenAt(LocalDateTime.now());
        photo.setLatitude(new BigDecimal("37.5665"));
        photo.setLongitude(new BigDecimal("126.9780"));
        photo.setStory(story);
        photos.add(photo);
        story.setPhotos(photos);

        // Hashtag 설정
        List<Hashtag> hashtags = new ArrayList<>();
        Hashtag hashtag = new Hashtag();
        hashtag.setName("testTag");
        hashtags.add(hashtag);
        route.setHashtags(hashtags);

        // Comment 설정
        List<Comment> comments = new ArrayList<>();
        Comment comment = new Comment();
        comment.setId(1L);
        comment.setContent("Test Comment");
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUser(user);
        comment.setStory(story);
        comments.add(comment);
        story.setComments(comments);



        return story;
    }
    @Test
    @WithMockUser(username = "testUser")
    @DisplayName("스토리 생성 성공 테스트")
    void createStory_Success() throws Exception {
        // Given
        ResponseStoryDto.CreateStoryRequest request = new ResponseStoryDto.CreateStoryRequest();
        request.setTitle("New Story");
        request.setMemo("Test Memo");
        request.setPreference(1);
        request.setHashtags(List.of("tag1", "tag2"));

        List<ResponseStoryDto.RoutePointDTO> routePoints = Arrays.asList(
                new ResponseStoryDto.RoutePointDTO(),
                new ResponseStoryDto.RoutePointDTO()
        );
        request.setRoutePoints(routePoints);

        // 반환될 Story 객체는 request 데이터와 일치하게 생성
        Story savedStory = new Story();
        savedStory.setStoryId(1L);
        savedStory.setTitle("New Story");  // request의 title과 일치
        savedStory.setDescription("Test Memo");  // request의 memo와 일치
        // ... 필요한 최소한의 데이터만 설정

        // Mock 설정
        when(storyService.createStory(
                any(User.class),
                eq(request.getTitle()),
                eq(request.getMemo()),
                eq(request.getPreference()),
                eq(request.getHashtags()),
                eq(request.getRoutePoints()),
                anyList()
        )).thenReturn(savedStory);
        // Mock 설정 수정


        // 스토리 정보를 JSON으로 변환
        MockMultipartFile storyInfo = new MockMultipartFile(
                "storyInfo",
                "",
                MediaType.APPLICATION_JSON_VALUE,
                objectMapper.writeValueAsBytes(request));

        // 테스트 이미지 파일들
        MockMultipartFile image1 = new MockMultipartFile(
                "images",
                "test1.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "test image content".getBytes());

        // When & Then
        mockMvc.perform(multipart("/api/stories")
                        .file(storyInfo)
                        .file(image1)
                        .with(user("testUser"))  // 사용자 인증 정보 추가
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.savedStoryId").exists())
                .andDo(print());

        // 서비스 메소드 호출 검증
        verify(storyService).createStory(
                any(User.class),
                eq("New Story"),
                eq("Test Memo"),
                eq(1),
                anyList(),
                anyList(),
                anyList()
        );
    }
    @Test
    @DisplayName("이미지 없는 스토리 생성 실패 테스트")
    void createStory_NoImages_Failure() throws Exception {
        // Given
        ResponseStoryDto.CreateStoryRequest request = new ResponseStoryDto.CreateStoryRequest();
        request.setTitle("New Story");
        request.setMemo("Test Memo");
        request.setPreference(1);
        request.setHashtags(List.of("tag1", "tag2"));

        MockMultipartFile storyInfo = new MockMultipartFile(
                "storyInfo",
                "",
                MediaType.APPLICATION_JSON_VALUE,
                objectMapper.writeValueAsBytes(request));

        // When & Then
        mockMvc.perform(multipart("/api/stories")
                        .file(storyInfo))
                .andExpect(status().isBadRequest())
                .andDo(print());
    }

    @Test
    @DisplayName("해시태그로 스토리 검색 - 직접 검색 결과 있음")
    void searchStoriesByHashtag_DirectSearchSuccess() throws Exception {
        // Given
        List<Story> stories = List.of(createSampleStory());
        Page<Story> storyPage = new PageImpl<>(stories);

        when(storyService.findStoriesByHashtag(anyString(), any(Pageable.class)))
                .thenReturn(storyPage);

        // When & Then
        mockMvc.perform(get("/api/stories/search")
                        .param("hashtag", "testTag")
                        .param("page", "0")
                        .param("size", "10")
                        .param("sort", "likeCount")
                        .param("direction", "desc")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Test Story"))
                .andExpect(jsonPath("$.content[0].likeCount").value(10))
                .andExpect(jsonPath("$.content[0].route.routePoints[0].latitude")
                        .value("37.5665"))
                .andExpect(jsonPath("$.content[0].route.routePoints[0].address")
                        .value("테스트 지번명1"))
                .andDo(print());
    }
    @Test
    @DisplayName("해시태그로 스토리 검색 - 직접 검색 결과 없음, 연관 검색어로 검색 성공")
    void searchStoriesByHashtag_RelatedSearchSuccess() throws Exception {
        // Given
        // 1. 직접 검색 결과 빈 페이지로 설정 (null이 아님)
        when(storyService.findStoriesByHashtag(eq("판교"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        // 2. 카카오 API 연관 검색어 반환 설정
        List<String> relatedKeywords = Arrays.asList("분당", "성남", "판교역");
        when(kakaoKeywordService.searchByKeywords("판교"))
                .thenReturn(relatedKeywords);

        // 3. 연관 검색어로 검색 시 결과 설정 (모든 연관 키워드에 대해 설정)
        Story story = createSampleStory();
        story.setTitle("Related Story");
        List<Story> storyList = Collections.singletonList(story);
        Page<Story> relatedStoryPage = new PageImpl<>(storyList);

        for (String keyword : relatedKeywords) {
            when(storyService.findStoriesByHashtag(eq(keyword), any(Pageable.class)))
                    .thenReturn(relatedStoryPage);
        }

        // When & Then
        mockMvc.perform(get("/api/stories/search")
                        .param("hashtag", "판교")
                        .param("page", "0")
                        .param("size", "10")
                        .param("sort", "createdAt")
                        .param("direction", "desc")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Related Story"))
                .andDo(print());
    }

    @Test
    @DisplayName("해시태그로 스토리 검색 - 직접 검색과 연관 검색 모두 결과 없음")
    void searchStoriesByHashtag_NoResults() throws Exception {
        // Given
        // 1. 직접 검색 결과 없음
        when(storyService.findStoriesByHashtag(anyString(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(new ArrayList<>()));

        // 2. 카카오 API 연관 검색어 반환
        List<String> relatedKeywords = Arrays.asList("분당", "성남", "판교역");
        when(kakaoKeywordService.searchByKeywords(anyString()))
                .thenReturn(relatedKeywords);

        // 3. 연관 검색어로도 결과 없음
        for (String keyword : relatedKeywords) {
            when(storyService.findStoriesByHashtag(eq(keyword), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(new ArrayList<>()));
        }

        // When & Then
        mockMvc.perform(get("/api/stories/search")
                        .param("hashtag", "존재하지않는해시태그")
                        .param("page", "0")
                        .param("size", "10")
                        .param("sort", "createdAt")
                        .param("direction", "desc")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent())
                .andDo(print());
    }

    @Test
    @DisplayName("해시태그로 스토리 검색 - 카카오 API 실패시에도 정상 동작")
    void searchStoriesByHashtag_KakaoApiFailure() throws Exception {
        // Given
        // 1. 직접 검색 결과 없음
        when(storyService.findStoriesByHashtag(anyString(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(new ArrayList<>()));

        // 2. 카카오 API 호출 실패 시뮬레이션
        when(kakaoKeywordService.searchByKeywords(anyString()))
                .thenReturn(Collections.emptyList());

        // When & Then
        mockMvc.perform(get("/api/stories/search")
                        .param("hashtag", "testTag")
                        .param("page", "0")
                        .param("size", "10")
                        .param("sort", "createdAt")
                        .param("direction", "desc")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent())
                .andDo(print());
    }

    @Test
    @DisplayName("스토리 상세 조회 - 이미지와 댓글 포함 테스트")
    void getStory_WithImagesAndComments() throws Exception {
        // Given
        Story story = createSampleStory();
        when(storyService.getStoryById(1L)).thenReturn(story);

        // When & Then
        mockMvc.perform(get("/api/stories/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.storyId").value(1))
                .andExpect(jsonPath("$.title").value("Test Story"))
                .andExpect(jsonPath("$.photos").isArray())
                .andExpect(jsonPath("$.photos[0].filePath").exists())
                .andExpect(jsonPath("$.comments").isArray())
                .andExpect(jsonPath("$.comments[0].content").value("Test Comment"))
                .andExpect(jsonPath("$.route.routePoints").isArray())
                .andDo(print());
    }

    @Test
    @DisplayName("스토리 업데이트 테스트")
    void updateStory_Success() throws Exception {
        // Given
        ResponseStoryDto.UpdateStoryRequest request = new ResponseStoryDto.UpdateStoryRequest();
        request.setTitle("Updated Title");
        request.setDescription("Updated Description");
        request.setVisibility(Story.Visibility.PUBLIC);
        request.setHashtags(List.of("updatedTag1", "updatedTag2"));

        Story updatedStory = createSampleStory();
        updatedStory.setTitle("Updated Title");
        updatedStory.setDescription("Updated Description");

        when(storyService.updateStory(eq(1L), any(ResponseStoryDto.UpdateStoryRequest.class)))
                .thenReturn(updatedStory);

        // When & Then
        mockMvc.perform(put("/api/stories/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.description").value("Updated Description"))
                .andDo(print());
    }

    @Test
    @DisplayName("좋아요 순으로 스토리 조회 테스트")
    void getTopStories_WithPaging() throws Exception {
        // Given
        List<Story> stories = Arrays.asList(createSampleStory());
        Page<Story> storyPage = new PageImpl<>(stories);

        when(storyService.getStoriesByLikes(any(Pageable.class)))
                .thenReturn(storyPage);

        // When & Then
        mockMvc.perform(get("/api/stories/top")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].likeCount").value(10))
                .andExpect(jsonPath("$.content[0].route.routePoints").exists())
                .andDo(print());
    }
}