// src/components/Home.js

import React, { useState, useEffect } from 'react';
import '../Home.css';
import AdSlider from './Adslider';
import { useNavigate } from 'react-router-dom';
import FooterNav from './Footernav';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [bestStories, setBestStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [username, setUsername] = useState('');

  // 사용자 정보 로드 및 콘솔 출력
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      console.log('로컬 스토리지에서 불러온 유저 정보:', user);
      setNickname(user.nickname || '닉네임'); // nickname을 올바르게 설정
      setUsername(user.username || 'username'); // username을 별도로 설정
    } else {
      console.log('로컬 스토리지에 사용자 정보가 없습니다.');
    }
  }, []);

  // 좋아요 순으로 정렬된 BEST 스토리를 백엔드에서 가져오는 함수
  useEffect(() => {
    const fetchBestStories = async () => {
      setIsLoading(true);
      try {
        // 페이징 요청으로 첫 페이지에서 3개의 스토리만 가져오기
        const response = await axiosInstance.get('/api/stories/top', {
          params: {
            page: 0, // 첫 번째 페이지
            size: 3, // 한 번에 3개만 가져오기
          },
        });
        setBestStories(response.data.content || []); // 페이징된 데이터의 content 배열 설정
      } catch (error) {
        console.error('BEST 스토리를 가져오는 중 오류 발생:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBestStories();
  }, []);

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
        <div className="nickname">{nickname}</div> {/* nickname을 표시 */}
        <div className="settings-icon" onClick={() => navigate('/settings')}>
          ⚙️ 설정
        </div>
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
        {isLoading ? (
          <p>스토리를 불러오는 중...</p>
        ) : (
          <ul className="story-list">
            {bestStories.length > 0 ? (
              bestStories.map((story, index) => (
                <li key={story.storyId} className="story-item">
                  <span
                    className="memory-title"
                    onClick={() => navigate(`/story/detail/${story.storyId}`)}
                  >
                    {story.title}
                  </span>
                  <span className="likes">좋아요 {story.likeCount}개</span>
                </li>
              ))
            ) : (
              <p>스토리가 없습니다.</p>
            )}
          </ul>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <FooterNav />
    </div>
  );
};

export default Home;
