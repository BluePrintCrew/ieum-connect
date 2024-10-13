package org.example.backend.repository;

import org.example.backend.domain.Like;
import org.example.backend.domain.Story;
import org.example.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    List<Like> findByStory_StoryId(Long storyId);
    boolean existsByStoryAndUser(Story story, User user);
    // 추가적인 쿼리 메소드를 여기에 정의할 수 있습니다.
}