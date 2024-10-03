package org.example.backend.repository;

import jakarta.persistence.EntityManager;
import org.example.backend.domain.Story;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface StoryRepository extends JpaRepository<Story, Long> {
    // 자신의 Story에 대한 것을 USer 객체의 UserId를 통해서 얻는 방법.
    List<Story> findByUserUserId(Long userId);
    List<Story> findByRouteHashtagsNameContainingIgnoreCase(String hashtag);
}

