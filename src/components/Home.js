import React from 'react';
import '.././Home.css'; // CSS 파일을 따로 생성하여 스타일을 정의
import AdSlider from './Adslider'; // 광고 슬라이더 컴포넌트 불러오기
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 useNavigate 훅 불러오기

const Home = () => {
  const navigate = useNavigate(); // useNavigate 훅 생성

  return (
    <div className="home-container">
      {/* 상단: 닉네임과 설정 */}
      <div className="header">
        <div className="nickname">닉네임</div>
        <div className="settings-icon" onClick={() => navigate('/settings')}>⚙️ 설정</div>
      </div>

      {/* 검색바 */}
      <div className="search-bar">
        <input type="text" placeholder="검색" />
      </div>

      {/* 광고 영역 */}
      <div className="ad-section">
        <AdSlider />
      </div>

      {/* BEST 스토리 */}
      <div className="best-story-section">
        <h2>BEST 스토리</h2>
        <ul className="story-list">
          <li className="story-item">
            <span className="story-number">1.</span>
            <span className="story-name">스토리 제목</span>
            <span className="likes">좋아요 수</span>
          </li>
          <li className="story-item">
            <span className="story-number">2.</span>
            <span className="story-name">스토리 제목</span>
            <span className="likes">좋아요 수</span>
          </li>
          <li className="story-item">
            <span className="story-number">3.</span>
            <span className="story-name">스토리 제목</span>
            <span className="likes">좋아요 수</span>
          </li>
          <li className="story-item">
            <span className="story-number">4.</span>
            <span className="story-name">스토리 제목</span>
            <span className="likes">좋아요 수</span>
          </li>
        </ul>
      </div>

      {/* 하단 네비게이션 */}
      <div className="footer-nav">
        <button onClick={() => navigate('/add-friend')}>친구추가</button>
        <button onClick={() => navigate('/record')}>스토리 기록하기</button>
        <button onClick={() => navigate('/memory-plan')}>추억 계획하기</button>
        <button onClick={() => navigate('/mypage')}>마이페이지</button>
      </div>
    </div>
  );
};

export default Home;