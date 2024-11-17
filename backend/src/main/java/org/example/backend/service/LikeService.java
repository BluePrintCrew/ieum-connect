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

@Service
@RequiredArgsConstructor
public class LikeService {
    private final LikeRepository likeRepository;
    private final StoryRepository storyRepository;
    private final UserRepository userRepository;
    /**
     * 좋아요를 추가하고 스토리의 좋아요 카운트를 증가시킵니다.
     * @param likeDto 좋아요 생성 정보
     * @return 생성된 Like 엔티티
     */
    @Transactional
    public Like addLike(LikeDto.LikeCreateDto likeDto) {
        Story story = storyRepository.findById(likeDto.getStoryId())
                .orElseThrow(() -> new EntityNotFoundException("Story not found"));
        User user = userRepository.findById(likeDto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // 중복 좋아요 방지
        if (likeRepository.existsByStoryAndUser(story, user)) {
            throw new IllegalStateException("User already liked this story");
        }

        // 좋아요 엔티티 생성
        Like like = new Like();
        like.setStory(story);
        like.setUser(user);
        like.setCreatedAt(LocalDateTime.now());

        // 스토리의 좋아요 카운트 증가
        incrementLikeCount(story);

        return likeRepository.save(like);
    }

    /**
     * 좋아요를 제거하고 스토리의 좋아요 카운트를 감소시킵니다.
     * @param likeId 제거할 좋아요의 ID
     */
    @Transactional
    public void removeLike(Long likeId) {
        Like like = likeRepository.findById(likeId)
                .orElseThrow(() -> new EntityNotFoundException("Like not found"));

        // 스토리의 좋아요 카운트 감소
        decrementLikeCount(like.getStory());

        likeRepository.deleteById(likeId);
    }

    public List<Like> getLikesByStory(Long storyId) {
        return likeRepository.findByStory_StoryId(storyId);
    }


    /**
     * 스토리의 좋아요 카운트를 증가시킵니다.
     * @param story 좋아요 카운트를 증가시킬 스토리
     */
    private void incrementLikeCount(Story story) {
        // null 체크 후 초기값 설정
        if (story.getLikeCount() == null) {
            story.setLikeCount(0);
        }
        story.setLikeCount(story.getLikeCount() + 1);
        storyRepository.save(story);
    }

    /**
     * 스토리의 좋아요 카운트를 감소시킵니다.
     * @param story 좋아요 카운트를 감소시킬 스토리
     */
    private void decrementLikeCount(Story story) {
        // 0 이하로 내려가지 않도록 체크
        if (story.getLikeCount() != null && story.getLikeCount() > 0) {
            story.setLikeCount(story.getLikeCount() - 1);
            storyRepository.save(story);
        }
    }

}

