package org.example.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import net.jcip.annotations.Immutable;
import org.example.backend.domain.Story;
import org.example.backend.dto.StoryDto;
import org.example.backend.service.StoryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@WebMvcTest(StoryController.class)
@Import(TestConfiguration.class)
public class StoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StoryService storyService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testCreateStory() throws Exception {
        StoryDto.CreateStoryRequest request = new StoryDto.CreateStoryRequest();
        request.setTitle("Test Title");
        request.setMemo("Test Memo");
        request.setPreference(1);
        request.setHashtags(Arrays.asList("#test", "#story"));

        Story mockStory = new Story();
        mockStory.setStoryId(1234L);

        // 일단 유져는 any() -> null 이여도 상관없다.
        when(storyService.createStory(any(), anyString(), anyString(), anyInt(), anyList(), anyList()))
                .thenReturn(mockStory);

        // 테스트용 multipartFile
        MockMultipartFile storyInfo = new MockMultipartFile(
                "storyInfo", "", "application/json", objectMapper.writeValueAsBytes(request));

        MockMultipartFile image1 = new MockMultipartFile(
                "images", "image1.jpg", "image/jpeg", "some-image".getBytes());
        MockMultipartFile image2 = new MockMultipartFile(
                "images", "image2.jpg", "image/jpeg", "some-other-image".getBytes());

        mockMvc.perform(multipart("/api/stories")
                        .file(storyInfo)
                        .file(image1)
                        .file(image2)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.savedStoryId").value(1234))
                .andExpect(jsonPath("$.message").value("스토리가 성공적으로 저장되었습니다."))
                .andExpect(jsonPath("$.createdAt").exists());
    }

}