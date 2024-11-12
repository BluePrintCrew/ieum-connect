import React, { useState, useEffect } from 'react';
import '../Mypage.css';
import { useNavigate } from 'react-router-dom';
import FooterNav from './Footernav';

const MyPage = () => {
  const navigate = useNavigate();
  const [myStories, setMyStories] = useState([]);
  const [likedStories, setLikedStories] = useState([]);

  // JSON 파일에서 데이터를 불러오는 함수
  useEffect(() => {
    const fetchMyStories = async () => {
      try {
        const response = await fetch('mock/mystory.json'); // mystory.json 경로
        if (!response.ok) {
          throw new Error('네트워크 응답에 문제가 있습니다.');
        }
        const data = await response.json();
        setMyStories(data);
      } catch (error) {
        console.error('mystory 데이터를 가져오는 도중 문제가 발생했습니다:', error);
      }
    };

    const fetchLikedStories = async () => {
      try {
        const response = await fetch('mock/likestory.json'); // likestory.json 경로
        if (!response.ok) {
          throw new Error('네트워크 응답에 문제가 있습니다.');
        }
        const data = await response.json();
        setLikedStories(data);
      } catch (error) {
        console.error('likestory 데이터를 가져오는 도중 문제가 발생했습니다:', error);
      }
    };

    fetchMyStories();
    fetchLikedStories();
  }, []);

  return (
    <div className="mypage-container">
      {/* 상단: 닉네임과 프로필 편집 */}
      <div className="profile-edit-container">
        <div className="nickname" style={{ textAlign: 'left' }}>닉네임</div>
        <button className="profile-edit-button">프로필 편집</button>
      </div>

      {/* 나의 추억 모음 */}
      <h2 className="mypage-title">나의 추억 모음</h2>
      {myStories.length > 0 ? (
        <ul className="memory-list">
          {myStories.map((story) => (
            <li
              key={story.storyId}
              className="memory-item"
              onClick={() => navigate(`/story/detail/${story.storyId}`)} // 클릭 시 디테일 페이지로 이동
            >
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
            <li
              key={story.storyId}
              className="memory-item"
              onClick={() => navigate(`/story/detail/${story.storyId}`)} // 클릭 시 디테일 페이지로 이동
            >
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
