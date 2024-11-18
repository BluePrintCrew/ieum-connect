package org.example.backend.service;


import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.backend.domain.Like;
import org.example.backend.domain.Story;
import org.example.backend.domain.User;
import org.example.backend.dto.LikeDto;
import org.example.backend.repository.LikeRepository;
import org.example.backend.repository.StoryRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LikeService {
    private final LikeRepository likeRepository;
    private final StoryRepository storyRepository;
    private final UserRepository userRepository;

    @Transactional
    public LikeDto addLike(LikeDto.LikeCreateDto likeDto) {
        Story story = storyRepository.findById(likeDto.getStoryId())
                .orElseThrow(() -> new EntityNotFoundException("Story not found"));
        User user = userRepository.findById(likeDto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (likeRepository.existsByStoryAndUser(story, user)) {
            throw new IllegalStateException("User already liked this story");
        }

        Like like = new Like();
        like.setStory(story);
        like.setUser(user);
        like.setCreatedAt(LocalDateTime.now());

        incrementLikeCount(story);
        Like savedLike = likeRepository.save(like);

        return convertToDto(savedLike);
    }

    @Transactional
    public void removeLikeByUserAndStory(Long userId, Long storyId) {
        Like like = likeRepository.findByUser_UserIdAndStory_StoryId(userId, storyId)
                .orElseThrow(() -> new EntityNotFoundException("Like not found"));

        decrementLikeCount(like.getStory());
        likeRepository.delete(like);
    }

    public List<LikeDto> getLikesByStory(Long storyId) {
        return likeRepository.findByStory_StoryId(storyId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private LikeDto convertToDto(Like like) {
        LikeDto dto = new LikeDto();
        dto.setId(like.getId());
        dto.setStoryId(like.getStory().getStoryId());
        dto.setUserId(like.getUser().getUserId());
        dto.setCreatedAt(like.getCreatedAt());
        return dto;
    }

    private void incrementLikeCount(Story story) {
        if (story.getLikeCount() == null) {
            story.setLikeCount(0);
        }
        story.setLikeCount(story.getLikeCount() + 1);
        storyRepository.save(story);
    }

    private void decrementLikeCount(Story story) {
        if (story.getLikeCount() != null && story.getLikeCount() > 0) {
            story.setLikeCount(story.getLikeCount() - 1);
            storyRepository.save(story);
        }
    }
}

