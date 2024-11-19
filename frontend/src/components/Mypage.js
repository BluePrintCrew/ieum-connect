import React, { useState, useEffect } from 'react';
import '../Mypage.css';
import { useNavigate } from 'react-router-dom';
import FooterNav from './Footernav';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

const MyPage = () => {
  const navigate = useNavigate();

  // 로컬 스토리지에서 사용자 정보 가져오기
  const userData = JSON.parse(localStorage.getItem('user'));
  const userId = parseInt(userData?.userId); // 사용자 ID를 숫자로 변환
  const username = userData?.username || '닉네임';

  const [myStories, setMyStories] = useState([]);
  const [likedStories, setLikedStories] = useState([]);

  // 나의 추억 모음 데이터 가져오기
  const fetchMyStories = async () => {
    try {
      const response = await axiosInstance.get(`/api/stories/member/${userId}`);
      console.log('Fetched my stories:', response.data);
      setMyStories(response.data || []);
    } catch (error) {
      console.error('나의 추억 데이터를 가져오는 중 오류 발생:', error.response ? error.response.data : error);
    }
  };

  // 좋아요 한 스토리 데이터 가져오기
  const fetchLikedStories = async () => {
    try {
      const response = await axiosInstance.get(`/api/stories/likes/${userId}`);
      console.log('Fetched liked stories:', response.data);
      setLikedStories(response.data || []);
    } catch (error) {
      console.error('좋아요 한 스토리 데이터를 가져오는 중 오류 발생:', error.response ? error.response.data : error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMyStories();
      fetchLikedStories();
    } else {
      console.log('User ID is not available in localStorage');
    }
  }, [userId]);

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
      <div className="middle-mypage">
        <h2 className="mypage-title">좋아요 한 스토리</h2>
        <button className="id-add-friend" onClick={() => navigate('/add-friend')}>
          ID로 팔로우
        </button>
      </div>
      {likedStories?.length > 0 ? (
        <ul className="memory-list">
          {likedStories.map((story) => (
            <li
              key={story.storyId}
              className="memory-item"
              onClick={() => navigate(`/story/detail/${story.storyId}`)}
            >
              <span className="memory-title">{story.title}</span>
              <span className="likes">좋아요 {story.likeCount}개</span>
              <button
                className="add-friend-button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/add-friend');
                }}
              >
                팔로우
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>좋아요 한 추억이 없습니다.</p>
      )}

      {/* 하단 네비게이션 */}
      <FooterNav />
    </div>
  );
};

export default MyPage;
