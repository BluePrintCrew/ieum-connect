package org.example.backend.service;

import org.apache.commons.imaging.ImageReadException;
import org.example.backend.domain.*;
import org.example.backend.dto.PhotoInfoDTO;
import org.example.backend.dto.ResponseStoryDto;
import org.example.backend.kakaosearch.kakaoadress.AddressResponse;
import org.example.backend.kakaosearch.kakaoadress.KakaoAddressService;
import org.example.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;


// Static imports for Mockito
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;

// Static imports for JUnit assertions
import static org.junit.jupiter.api.Assertions.*;


@ExtendWith(MockitoExtension.class)
class StoryServiceTest {
    @Mock
    private StoryRepository storyRepository;
    @Mock
    private RouteRepository routeRepository;
    @Mock
    private RoutePointRepository routePointRepository;
    @Mock
    private PhotoRepository photoRepository;
    @Mock
    private HashtagRepository hashtagRepository;
    @Mock
    private PhotoService photoService;
    @Mock
    private KakaoAddressService kakaoAddressService;

    @InjectMocks
    private StoryService storyService;

    private User testUser;
    private Story testStory;
    private Route testRoute;
    private RoutePoint testRoutePoint;
    private Photo testPhoto;
    private ResponseStoryDto.CreateStoryRequest createStoryRequest;
    private List<ResponseStoryDto.RoutePointDTO> routePointDTOList;

    @BeforeEach
    void setUp() {
        // 기본 테스트 데이터 설정
        testUser = new User();
        testUser.setUserId(1L);
        testUser.setUsername("testUser");

        testStory = new Story();
        testStory.setStoryId(1L);
        testStory.setUser(testUser);
        testStory.setTitle("Test Story");
        testStory.setDescription("Test Description");
        testStory.setVisibility(Story.Visibility.PUBLIC);

        // RoutePoint DTO 설정
        ResponseStoryDto.RoutePointDTO routePointDTO = new ResponseStoryDto.RoutePointDTO(
                new BigDecimal("37.5665"),
                new BigDecimal("126.9780"),
                1
        );
        routePointDTOList = Collections.singletonList(routePointDTO);

        // CreateStoryRequest 설정
        createStoryRequest = new ResponseStoryDto.CreateStoryRequest();
        createStoryRequest.setTitle("Test Story");
        createStoryRequest.setMemo("Test Description");
        createStoryRequest.setPreference(5);
        createStoryRequest.setVisibility(Story.Visibility.PUBLIC);
        createStoryRequest.setHashtags(Arrays.asList("test", "new"));
        createStoryRequest.setRoutePoints(routePointDTOList);
    }

    @Test
    @DisplayName("Story 생성 테스트 - 정상 케이스")
    void createStory_Success() throws IOException, ImageReadException {
        // Given
        MockMultipartFile testFile = new MockMultipartFile(
                "test.jpg",
                "test.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        AddressResponse addressResponse = new AddressResponse();
        addressResponse.setAddress("서울시 중구");
        addressResponse.setRoadAddress("서울시 중구 세종대로");

        PhotoInfoDTO photoInfoDTO = new PhotoInfoDTO();
        photoInfoDTO.setFileName("test.jpg");
        photoInfoDTO.setLatitude(new BigDecimal("37.5665"));
        photoInfoDTO.setLongitude(new BigDecimal("126.9780"));
        photoInfoDTO.setTakenAt(LocalDateTime.now().toString());
        photoInfoDTO.setOrderNum(0);

        // Stubbing
        when(kakaoAddressService.coordToAddress(
                new BigDecimal("37.5665").doubleValue(),
                new BigDecimal("126.9780").doubleValue()
        )).thenReturn(addressResponse);

        when(photoService.extractMetadata(any(MultipartFile.class)))
                .thenReturn(photoInfoDTO);

        when(storyRepository.save(any(Story.class)))
                .thenReturn(testStory);

        // When
        Story createdStory = storyService.createStory(
                testUser,
                createStoryRequest.getTitle(),
                createStoryRequest.getMemo(),
                createStoryRequest.getPreference(),
                createStoryRequest.getVisibility(),
                createStoryRequest.getHashtags(),
                createStoryRequest.getRoutePoints(),
                Collections.singletonList(testFile)
        );

        // Then
        assertNotNull(createdStory);
        assertEquals(createStoryRequest.getTitle(), createdStory.getTitle());
        verify(storyRepository).save(any(Story.class));
    }

    @Test
    @DisplayName("Story 생성 실패 테스트 - 이미지 처리 오류")
    void createStory_FailureImageProcessing() throws IOException, ImageReadException {
        // Given
        MockMultipartFile testFile = new MockMultipartFile(
                "test.jpg",
                "test.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        AddressResponse addressResponse = new AddressResponse();
        addressResponse.setAddress("서울시 중구");
        addressResponse.setRoadAddress("서울시 중구 세종대로");

        when(kakaoAddressService.coordToAddress(
                new BigDecimal("37.5665").doubleValue(),
                new BigDecimal("126.9780").doubleValue()
        )).thenReturn(addressResponse);

        when(photoService.extractMetadata(any(MultipartFile.class)))
                .thenThrow(new IOException("Failed to process image"));

        // When & Then
        assertThrows(RuntimeException.class, () ->
                storyService.createStory(
                        testUser,
                        createStoryRequest.getTitle(),
                        createStoryRequest.getMemo(),
                        createStoryRequest.getPreference(),
                        createStoryRequest.getVisibility(),
                        createStoryRequest.getHashtags(),
                        createStoryRequest.getRoutePoints(),
                        Collections.singletonList(testFile)
                )
        );
    }

    @Test
    @DisplayName("Story 생성 실패 테스트 - 필수 필드 누락")
    void createStory_FailureMissingRequiredFields() {
        // Given
        createStoryRequest.setTitle(null);  // 필수 필드 누락

        AddressResponse addressResponse = new AddressResponse();
        addressResponse.setAddress("서울시 중구");
        addressResponse.setRoadAddress("서울시 중구 세종대로");

        when(kakaoAddressService.coordToAddress(
                new BigDecimal("37.5665").doubleValue(),
                new BigDecimal("126.9780").doubleValue()
        )).thenReturn(addressResponse);

        // When & Then
        assertThrows(IllegalArgumentException.class, () ->
                storyService.createStory(
                        testUser,
                        createStoryRequest.getTitle(),
                        createStoryRequest.getMemo(),
                        createStoryRequest.getPreference(),
                        createStoryRequest.getVisibility(),
                        createStoryRequest.getHashtags(),
                        createStoryRequest.getRoutePoints(),
                        null
                )
        );
    }
}