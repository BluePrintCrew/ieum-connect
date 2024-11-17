package org.example.backend.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.backend.domain.Comment;
import org.example.backend.domain.Story;
import org.example.backend.domain.User;
import org.example.backend.dto.CommentDto;
import org.example.backend.repository.CommentRepository;
import org.example.backend.repository.StoryRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final StoryRepository storyRepository;
    private final UserRepository userRepository;

    public Comment addComment(CommentDto.CommentCreateDto commentDto) {
        Story story = storyRepository.findById(commentDto.getStoryId())
                .orElseThrow(() -> new EntityNotFoundException("Story not found"));
        User user = userRepository.findById(commentDto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Comment comment = new Comment();
        comment.setStory(story);
        comment.setUser(user);
        comment.setContent(commentDto.getContent());
        comment.setCreatedAt(LocalDateTime.now());

        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsByStory(Long storyId) {
        return commentRepository.findByStoryStoryId(storyId);
    }

    // 기타 CRUD 작업
}