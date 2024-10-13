package org.example.backend.repository;

import org.example.backend.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByStoryStoryId(Long storyId);
    // 추가적인 쿼리 메소드를 여기에 정의할 수 있습니다.
}