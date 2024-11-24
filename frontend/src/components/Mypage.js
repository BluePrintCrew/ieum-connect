import React, { useState, useEffect } from 'react';
import '../Mypage.css';
import { useNavigate } from 'react-router-dom';
import FooterNav from './Footernav';
import axios from 'axios';
import CantFollowing from './CantFollowing'; // 모달 컴포넌트 임포트

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

const MyPage = () => {
  const navigate = useNavigate();

  // 로컬 스토리지에서 현재 로그인한 사용자 정보 가져오기
  const userData = JSON.parse(localStorage.getItem('user'));
  const currentUserId = parseInt(userData?.userId, 10); // 현재 로그인한 사용자의 ID
  const username = userData?.username || '닉네임';

  const [myStories, setMyStories] = useState([]);
  const [likedStories, setLikedStories] = useState([]);
  const [plannedStories, setPlannedStories] = useState([]); // 계획 중인 스토리 상태 추가
  const [following, setFollowing] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 창 상태

  // 나의 추억 모음 데이터 가져오기
  const fetchMyStories = async () => {
    try {
      const response = await axiosInstance.get(`/api/stories/member/${currentUserId}`);
      setMyStories(response.data || []);
    } catch (error) {
      console.error(
        '나의 추억 데이터를 가져오는 중 오류 발생:',
        error.response ? error.response.data : error
      );
    }
  };

  // 좋아요 한 스토리 데이터 가져오기
  const fetchLikedStories = async () => {
    try {
      const response = await axiosInstance.get(`/api/stories/likes/${currentUserId}`);
      setLikedStories(response.data || []);
    } catch (error) {
      console.error(
        '좋아요 한 스토리 데이터를 가져오는 중 오류 발생:',
        error.response ? error.response.data : error
      );
    }
  };

  // 계획 중인 스토리 데이터 가져오기
  const fetchPlannedStories = async () => {
    try {
      const response = await axiosInstance.get(`/api/stories/planned/${currentUserId}`);
      setPlannedStories(response.data || []);
    } catch (error) {
      console.error(
        '계획 중인 스토리 데이터를 가져오는 중 오류 발생:',
        error.response ? error.response.data : error
      );
    }
  };

  // 팔로우 여부 확인을 위한 데이터 가져오기
  const fetchFollowing = async () => {
    try {
      const response = await axiosInstance.get(`/api/follows/followings/${currentUserId}`);
      const followingIds = response.data.map((follow) => follow.followingId);
      setFollowing(followingIds);
    } catch (error) {
      console.error(
        '팔로잉 목록을 가져오는 중 오류 발생:',
        error.response ? error.response.data : error
      );
    }
  };

  // 특정 사용자를 팔로우하기 위한 API 호출
  const followUser = async (authorId) => {
    try {
      await axiosInstance.post(`/api/follows`, {
        followerId: currentUserId,
        followingId: authorId,
      });
      setFollowing((prevFollowing) => [...prevFollowing, authorId]);
    } catch (error) {
      console.error(
        '팔로우 요청 중 오류 발생:',
        error.response ? error.response.data : error
      );
    }
  };

  // 특정 사용자를 언팔로우하기 위한 API 호출
  const unfollowUser = async (authorId) => {
    try {
      await axiosInstance.delete(`/api/follows`, {
        data: {
          followerId: currentUserId,
          followingId: authorId,
        },
      });
      setFollowing((prevFollowing) => prevFollowing.filter((id) => id !== authorId));
    } catch (error) {
      console.error(
        '언팔로우 요청 중 오류 발생:',
        error.response ? error.response.data : error
      );
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchMyStories();
      fetchLikedStories();
      fetchPlannedStories(); // 계획 중인 스토리 데이터 가져오기
      fetchFollowing();
    } else {
      console.error('User ID is not available in localStorage');
    }
  }, [currentUserId]);

  const handleDeleteStory = async (storyId) => {
    if (window.confirm('정말로 이 스토리를 삭제하시겠습니까?')) {
      try {
        await axiosInstance.delete(`/api/stories/${storyId}`);
        setMyStories((prevStories) =>
          prevStories.filter((story) => story.storyId !== storyId)
        );
      } catch (error) {
        console.error('스토리 삭제 중 오류 발생:', error);
        alert('스토리 삭제에 실패했습니다.');
      }
    }
  };

  // 계획 중 스토리 삭제 함수
  const handleDeletePlannedStory = async (storyId) => {
    if (window.confirm('정말로 이 계획을 삭제하시겠습니까?')) {
      try {
        await axiosInstance.delete(`/api/stories/${storyId}`);
        setPlannedStories((prevStories) =>
          prevStories.filter((story) => story.storyId !== storyId)
        );
      } catch (error) {
        console.error('계획 삭제 중 오류 발생:', error);
        alert('계획 삭제에 실패했습니다.');
      }
    }
  };

  // 계획 중 스토리 기록하기로 이동
  const handleRecordPlannedStory = (storyId) => {
    navigate(`/storyplan/regist/${storyId}`);
  };

  const handleFollowButtonClick = (e, storyUserId) => {
    e.stopPropagation();
    if (storyUserId && storyUserId !== currentUserId) {
      if (following.includes(storyUserId)) {
        unfollowUser(storyUserId);
      } else {
        followUser(storyUserId);
      }
    } else if (storyUserId === currentUserId) {
      setIsModalOpen(true); // 모달 창 표시
    } else {
      console.error('작성자 ID가 없습니다.');
    }
  };

  return (
    <div className="mypage-container">
      {/* 상단: 닉네임과 프로필 편집 */}
      <div className="profile-edit-container">
        <div className="nickname" style={{ textAlign: 'left' }}>
          {username}
        </div>
        <button className="profile-edit-button" onClick={() => navigate('/edit-profile')}>
          프로필 편집
        </button>
      </div>

      {/* 나의 추억 모음 */}
      <h2 className="mypage-title">나의 추억 모음</h2>
      {myStories?.length > 0 ? (
        <ul className="memory-list">
          {myStories.map((story) => (
            <li key={story.storyId} className="memory-item">
              <span
                className="memory-title"
                onClick={() => navigate(`/story/detail/${story.storyId}`)}
              >
                {story.title}
              </span>
              <span className="likes">좋아요 {story.likeCount}개</span>
              <button
                className="edit-button"
                onClick={() => navigate(`/story/edit/${story.storyId}`)}
              >
                수정
              </button>
              <button
                className="delete-button"
                onClick={() => handleDeleteStory(story.storyId)}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>아직 작성한 추억이 없습니다.</p>
      )}

      {/* 좋아요 한 스토리 */}
      <h2 className="mypage-title">좋아요 한 스토리</h2>
      {likedStories?.length > 0 ? (
        <ul className="memory-list">
          {likedStories.map((story) => {
            const storyUserId = story?.user?.userId;
            const isFollowing = following.includes(storyUserId);

            return (
              <li
                key={story.storyId}
                className="memory-item"
                onClick={() => navigate(`/story/detail/${story.storyId}`)}
              >
                <span className="memory-title">{story.title}</span>
                <span className="likes">좋아요 {story.likeCount}개</span>
                <button
                  className="add-friend-button"
                  onClick={(e) => handleFollowButtonClick(e, storyUserId)}
                >
                  {storyUserId === currentUserId
                    ? '팔로우'
                    : isFollowing
                    ? '언팔로우'
                    : '팔로우'}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>좋아요 한 추억이 없습니다.</p>
      )}

      {/* 계획 중인 스토리 */}
      <h2 className="mypage-title">계획 중인 스토리</h2>
      {plannedStories?.length > 0 ? (
        <ul className="memory-list">
          {plannedStories.map((story) => (
            <li key={story.storyId} className="memory-item">
              <span
                className="memory-title"
                onClick={() => navigate(`/story/detail/${story.storyId}`)}
              >
                {story.title}
              </span>
              <button
                className="check-button"
                onClick={() => handleRecordPlannedStory(story.storyId)}
              >
                확정
              </button>
              <button
                className="delete-button"
                onClick={() => handleDeletePlannedStory(story.storyId)}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>계획 중인 스토리가 없습니다.</p>
      )}

      {/* 자신을 팔로우하려는 경우 모달 창 */}
      <CantFollowing isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Footer Navigation */}
      <FooterNav />
    </div>
  );
};

export default MyPage;
