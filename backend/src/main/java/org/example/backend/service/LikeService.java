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

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LikeService {
    private final LikeRepository likeRepository;
    private final StoryRepository storyRepository;
    private final UserRepository userRepository;

    public Like addLike(LikeDto likeDto) {
        Story story = storyRepository.findById(likeDto.getStoryId())
                .orElseThrow(() -> new EntityNotFoundException("Story not found"));
        User user = userRepository.findById(likeDto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // 중복 좋아요 방지
        if (likeRepository.existsByStoryAndUser(story, user)) {
            throw new IllegalStateException("User already liked this story");
        }

        Like like = new Like();
        like.setStory(story);
        like.setUser(user);
        like.setCreatedAt(LocalDateTime.now());

        return likeRepository.save(like);
    }

    public void removeLike(Long likeId) {
        likeRepository.deleteById(likeId);
    }

    public List<Like> getLikesByStory(Long storyId) {
        return likeRepository.findByStory_StoryId(storyId);
    }
}

