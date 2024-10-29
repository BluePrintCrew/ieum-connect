import React, { useState, useEffect } from 'react';
import '../Mypage.css';
import { useNavigate } from 'react-router-dom';
import FooterNav from './Footernav';

const MyPage = () => {
  const navigate = useNavigate();
  const [bestStories, setBestStories] = useState([
    { id: 1, title: "행복한 여행", likes: 120 },
    { id: 2, title: "맛있는 음식 여행", likes: 98 },
    { id: 3, title: "도시 탐방", likes: 75 },
    { id: 4, title: "산과 바다의 조화", likes: 67 },
    { id: 5, title: "자연과 함께하는 힐링", likes: 55 },
  ]);
  const [likedStories, setLikedStories] = useState([
    { id: 6, title: "신나는 놀이공원", likes: 200 },
    { id: 7, title: "캠핑의 즐거움", likes: 150 },
  ]);

  return (
    <div className="mypage-container">
      {/* 상단: 닉네임과 프로필 편집 */}
      <div className="profile-edit-container">
        <div className="nickname" style={{ textAlign: 'left' }}>닉네임</div>
        <button className="profile-edit-button">프로필 편집</button>
      </div>

      {/* 나의 추억 모음 */}
      <h2 className="mypage-title">나의 추억 모음</h2>
      {bestStories.length > 0 ? (
        <ul className="memory-list">
          {bestStories.map((story) => (
            <li key={story.id} className="memory-item">
              <span className="memory-title">{story.title}</span>
              <span className="likes">좋아요 {story.likes}개</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>아직 작성한 추억이 없습니다.</p>
      )}

      {/* 좋아요 한 스토리 */}
      <div className="middle-mypage">
      <h2 className="mypage-title">좋아요 한 스토리</h2> 
      <button className="id-add-friend" onClick={() => navigate('/add-friend')}>ID로 팔로우</button>
      </div>
      {likedStories.length > 0 ? (
        <ul className="memory-list">
          {likedStories.map((story) => (
            <li key={story.id} className="memory-item">
              <span className="memory-title">{story.title}</span>
              <span className="likes">좋아요 {story.likes}개</span>
              <button className="add-friend-button" onClick={() => navigate('/add-friend')}>팔로우</button>
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
