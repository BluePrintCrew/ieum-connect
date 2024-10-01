package org.example.backend.controller;

import org.example.backend.domain.Story;
import org.example.backend.domain.User;
import org.example.backend.dto.ResponseStoryDto;
import org.example.backend.service.StoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class StoryControllerTest {

    @Mock
    private StoryService storyService;

    @InjectMocks
    private StoryController storyController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createStory_Success() throws IOException {

        ResponseStoryDto.CreateStoryRequest request = new ResponseStoryDto.CreateStoryRequest();
        request.setTitle("테스트 스토리 제목");
        request.setMemo("태스트 메모");
        request.setPreference(5);
        request.setHashtags(Arrays.asList("#tag", "#tag"));

        List<MultipartFile> images = Arrays.asList(
                new MockMultipartFile("image1", "image1.jpg", MediaType.IMAGE_JPEG_VALUE, "test image 1".getBytes()), // getBytes 는 1바이트 크기의 index를 갖는 바이트 배열 로 자료형 변경
                new MockMultipartFile("image2", "image2.jpg", MediaType.IMAGE_JPEG_VALUE, "test image 2".getBytes())
        );

        Story mockStory = new Story();
        mockStory.setStoryId(1L);

        when(storyService.createStory(any(User.class), anyString(), anyString(), anyInt(), anyList(), anyList()))
                .thenReturn(mockStory);


        ResponseEntity<?> response = storyController.createStory(request, images); // 실행

        // Assert
        assertTrue(response.getStatusCode().is2xxSuccessful());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof ResponseStoryDto.CreateStoryResponse);

        ResponseStoryDto.CreateStoryResponse responseBody = (ResponseStoryDto.CreateStoryResponse) response.getBody();
        assertEquals("success", responseBody.getStatus());
        assertEquals("스토리가 성공적으로 저장되었습니다.", responseBody.getMessage());
        assertEquals(1L, responseBody.getSavedStoryId());
        assertNotNull(responseBody.getCreatedAt());

        verify(storyService, times(1)).createStory(any(User.class), eq("Test Story"), eq("Test Memo"), eq(5), eq(Arrays.asList("tag1", "tag2")), eq(images));
    }

    @Test
    void createStory_Failure() throws IOException {
        // Arrange
        ResponseStoryDto.CreateStoryRequest request = new ResponseStoryDto.CreateStoryRequest();
        request.setTitle("Test Story");
        request.setMemo("Test Memo");
        request.setPreference(5);
        request.setHashtags(Arrays.asList("tag1", "tag2"));

        List<MultipartFile> images = Arrays.asList(
                new MockMultipartFile("image1", "image1.jpg", MediaType.IMAGE_JPEG_VALUE, "test image 1".getBytes())
        );

        when(storyService.createStory(any(User.class), anyString(), anyString(), anyInt(), anyList(), anyList()))
                .thenThrow(new IOException("Test exception"));

        // Act
        ResponseEntity<?> response = storyController.createStory(request, images);

        // Assert
        assertTrue(response.getStatusCode().is4xxClientError());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof ResponseStoryDto.ErrorResponse);

        ResponseStoryDto.ErrorResponse errorResponse = (ResponseStoryDto.ErrorResponse) response.getBody();
        assertEquals("error", errorResponse.getStatus());
        assertEquals("스토리 저장 중 오류가 발생했습니다: Test exception", errorResponse.getMessage());

        verify(storyService, times(1)).createStory(any(User.class), eq("Test Story"), eq("Test Memo"), eq(5), eq(Arrays.asList("tag1", "tag2")), eq(images));
    }
}