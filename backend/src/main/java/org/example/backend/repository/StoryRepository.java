package org.example.backend.repository;

import jakarta.persistence.EntityManager;
import org.example.backend.domain.Story;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;

import java.util.List;


@Repository
public interface StoryRepository extends JpaRepository<Story, Long> {
    // 자신의 Story에 대한 것을 USer 객체의 UserId를 통해서 얻는 방법.
    List<Story> findByUserUserId(Long userId);
    Story findByStoryId(Long storyId);

    Page<Story> findByRouteHashtagsNameContainingIgnoreCase(String hashtag, Pageable pageable);

    // 좋아요 수로 정렬된 스토리 조회를 위한 메서드 추가
    Page<Story> findAllByOrderByLikeCountDesc(Pageable pageable);
    Page<Story> findAllByOrderByCreatedAtDesc(Pageable pageable);
}

