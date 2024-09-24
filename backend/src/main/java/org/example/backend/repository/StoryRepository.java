package org.example.backend.repository;

import org.example.backend.domain.Story;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;



@Repository
public interface StoryRepository extends JpaRepository<Story, Long> {
}

