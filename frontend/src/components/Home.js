import React, { useState, useEffect } from 'react';
import '../Home.css';
import AdSlider from './Adslider';
import { useNavigate } from 'react-router-dom';
import FooterNav from './Footernav';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [bestStories, setBestStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nickname, setNickname] = useState('');

  // 사용자 정보 로드 및 콘솔 출력
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      console.log('로컬 스토리지에서 불러온 유저 정보:', user);
      setNickname(user.username || '닉네임');
    } else {
      console.log('로컬 스토리지에 사용자 정보가 없습니다.');
    }
  }, []);

  // JSON 파일에서 데이터를 불러오는 함수
  useEffect(() => {
    const fetchBestStories = async () => {
      try {
        const response = await fetch('/mock/beststories.json'); // public 폴더 내 JSON 파일 경로
        if (!response.ok) {
          throw new Error('네트워크 응답에 문제가 있습니다.');
        }
        const data = await response.json();
        setBestStories(data);
      } catch (error) {
        console.error('데이터를 가져오는 도중 문제가 발생했습니다:', error);
      } finally {
        setIsLoading(false); // 데이터 로딩 완료 여부 설정
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
        <div className="nickname">{nickname}</div>
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
        {isLoading ? (
          <p>스토리를 불러오는 중...</p>
        ) : (
          <ul className="story-list">
            {bestStories.length > 0 ? (
              bestStories.map((story, index) => (
                <li 
                  key={story.storyId} 
                  className="story-item" 
                  onClick={() => navigate(`/story/detail/${story.storyId}`)}
                >
                  <span className="story-number">{index + 1}.</span>
                  <span className="story-name">{story.title}</span>
                  <span className="likes">좋아요 {story.likes}개</span>
                </li>
              ))
            ) : (
              <p>스토리가 없습니다.</p>
            )}
          </ul>
        )}
      </div>

      {/* FooterNav 컴포넌트 사용 */}
     
    </div>
  );
};

export default Home;
