package org.example.backend.controller;

import org.example.backend.domain.Story;
import org.example.backend.domain.User;
import org.example.backend.dto.StoryDto;
import org.example.backend.service.StoryService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.ZonedDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/stories")
public class StoryController {

    private final StoryService storyService;

    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }

    //json 과 image 파일을 따로 생성해서 받게 된다.
    // @RequestPart는 여러가지 , 데이터 타입을 한번에 보내는 요청을 받을 때 분리 할 수 있도록 한다.
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createStory(
            @RequestPart("storyInfo") StoryDto.CreateStoryRequest request,
            @RequestPart("images") List<MultipartFile> images) {
        try {
            // 추후 user 로그인 개발하면됨.
            User tempUser = new User();
            tempUser.setUserId(1L);

            Story savedStory = storyService.createStory(tempUser, request.getTitle(), request.getMemo(),
                    request.getPreference(), request.getHashtags(), images);

            StoryDto.CreateStoryResponse response = new StoryDto.CreateStoryResponse();
            response.setStatus("success");
            response.setMessage("스토리가 성공적으로 저장되었습니다.");
            response.setSavedStoryId(savedStory.getStoryId());
            response.setCreatedAt(ZonedDateTime.now());

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            StoryDto.ErrorResponse errorResponse = new StoryDto.ErrorResponse();
            errorResponse.setStatus("error");
            errorResponse.setMessage("스토리 저장 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}