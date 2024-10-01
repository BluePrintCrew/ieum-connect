package org.example.backend.repository;

import jakarta.persistence.EntityManager;
import org.example.backend.domain.Story;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface StoryRepository extends JpaRepository<Story, Long> {
    List<Story> findByUserUserId(Long userId);
}

