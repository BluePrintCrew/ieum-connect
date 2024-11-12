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

//    // route -> hashtag -> name 순으로 쿼리하는 것이기 때문에 느릴 수 있다.
//    Page<Story> findByRouteHashtagsNameContainingIgnoreCase(String hashtag, Pageable pageable);
//
//    // 좋아요 수로 정렬된 스토리 조회를 위한 메서드 추가
//    Page<Story> findAllByOrderByLikeCountDesc(Story.Visibility.PUBLIC,Pageable pageable);
//    Page<Story> findAllByOrderByCreatedAtDesc(Pageable pageable); // hashtag 검색 - public만 조회

    Page<Story> findByRouteHashtagsNameContainingIgnoreCaseAndVisibility(
            String hashtag,
            Story.Visibility visibility,
            Pageable pageable
    );

    // 좋아요 수 정렬 - public만 조회
    Page<Story> findByVisibilityOrderByLikeCountDesc(
            Story.Visibility visibility,
            Pageable pageable
    );

    // 최신순 정렬 - public만 조회
    Page<Story> findByVisibilityOrderByCreatedAtDesc(
            Story.Visibility visibility,
            Pageable pageable
    );
}

