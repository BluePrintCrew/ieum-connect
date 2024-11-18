package org.example.backend.repository;

import org.example.backend.domain.Like;
import org.example.backend.domain.Story;
import org.example.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    List<Like> findByStory_StoryId(Long storyId);
    boolean existsByStoryAndUser(Story story, User user);
    Optional<Like> findByUser_UserIdAndStory_StoryId(Long userId, Long storyId);
}