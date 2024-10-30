package org.example.backend.controller;



import org.example.backend.config.TestSecurityConfig;
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
import static org.mockito.Mockito.when;

// Spring Test 관련 imports
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
    @DisplayName("스토리 생성 성공 테스트")
    void createStory_Success() throws Exception {
        // Given
        ResponseStoryDto.CreateStoryRequest request = new ResponseStoryDto.CreateStoryRequest();
        request.setTitle("New Story");
        request.setMemo("Test Memo");
        request.setPreference(1);
        request.setHashtags(List.of("tag1", "tag2"));

        Story savedStory = createSampleStory();
        when(storyService.createStory(any(User.class), anyString(), anyString(), anyInt(), anyList(), anyList()))
                .thenReturn(savedStory);

        // 스토리 정보를 JSON으로 변환
        MockMultipartFile storyInfo = new MockMultipartFile(
                "storyInfo",
                "",
                MediaType.APPLICATION_JSON_VALUE,
                objectMapper.writeValueAsBytes(request));

        // 테스트 이미지 파일 생성
        MockMultipartFile image1 = new MockMultipartFile(
                "images",
                "test1.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "test image content".getBytes());

        MockMultipartFile image2 = new MockMultipartFile(
                "images",
                "test2.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "test image content".getBytes());

        // When & Then
        mockMvc.perform(multipart("/api/stories")
                        .file(storyInfo)
                        .file(image1)
                        .file(image2))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.savedStoryId").exists())
                .andDo(print());
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
    @DisplayName("해시태그로 스토리 검색 - 정렬 및 페이징 테스트")
    void searchStoriesByHashtag_WithSortingAndPaging() throws Exception {
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