package org.example.backend.repository;

import org.example.backend.domain.Follow;
import org.example.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FollowRepository extends JpaRepository<Follow, Long> {
    boolean existsByFollowerAndFollowing(User follower, User following);
    void deleteByFollowerAndFollowing(User follower, User following);
    List<Follow> findAllByFollower(User follower);
    List<Follow> findAllByFollowing(User following);

    boolean existsByFollowerUserIdAndFollowingUserId(Long followerId, Long followingId);
}
