import React, { useState } from 'react';
import '../Home.css';
import AdSlider from './Adslider';
import { useNavigate } from 'react-router-dom';
import FooterNav from './Footernav';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // BEST 스토리 데이터 배열 (서버에서 가져와야 할 부분)
  const bestStories = [
    { id: 1, title: "행복한 여행", likes: 120 },
    { id: 2, title: "맛있는 음식 여행", likes: 98 },
    { id: 3, title: "도시 탐방", likes: 75 },
    { id: 4, title: "산과 바다의 조화", likes: 67 },
    { id: 5, title: "자연과 함께하는 힐링", likes: 55 },
  ];

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="home-container">
      {/* 상단: 닉네임과 설정 */}
      <div className="header">
        <div className="nickname">닉네임</div>
        <div className="settings-icon" onClick={() => navigate('/settings')}>⚙️ 설정</div>
      </div>

      {/* 검색바 */}
      <div className="search-bar">
        <input 
          type="text" 
          placeholder="검색" 
          value={searchQuery} 
          onChange={handleSearchChange} 
          onKeyPress={handleKeyPress} // Enter 키 입력 시 검색 실행
        />
      </div>

      {/* 광고 영역 */}
      <div className="ad-section">
        <AdSlider />
      </div>

      {/* BEST 스토리 */}
      <div className="best-story-section">
        <h2>BEST 스토리</h2>
        <ul className="story-list">
          {bestStories.map((story, index) => (
            <li key={story.id} className="story-item">
              <span className="story-number">{index + 1}.</span>
              <span className="story-name">{story.title}</span>
              <span className="likes">좋아요 {story.likes}개</span>
            </li>
          ))}
        </ul>
      </div>

      {/* FooterNav 컴포넌트 사용 */}
      <FooterNav />
    </div>
  );
};

export default Home;
