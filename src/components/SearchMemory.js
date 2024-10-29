import React, { useState, useEffect } from 'react';
import '../Home.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SearchMemory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [filterOption, setFilterOption] = useState('추천순');
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery) {
      fetchSearchResults();
    }
  }, [filterOption]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchSearchResults();
    }
  };

  const fetchSearchResults = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/stories/search', {
        params: {
          hashtag: searchQuery,
          sort: filterOption === '추천순' ? 'likes' : 'date',
        },
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error("검색 결과를 가져오는 데 실패했습니다:", error);
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
          placeholder="검색어를 입력하세요" 
          value={searchQuery} 
          onChange={handleSearchChange} 
          onKeyPress={handleKeyPress} 
        />
      </div>

      {/* 필터 옵션 */}
      <div className="filter-options">
        <select value={filterOption} onChange={(e) => setFilterOption(e.target.value)}>
          <option value="추천순">추천순</option>
          <option value="최신순">최신순</option>
        </select>
      </div>

      {/* 검색 결과 리스트 */}
      <div className="search-results">
        {searchResults.length > 0 ? (
          searchResults.map((result, index) => (
            <div key={result.storyId} className="story-item">
              <span className="story-number">{index + 1}.</span>
              <span className="story-name">{result.title}</span>
              <span className="likes">좋아요 {result.photoCount}개</span>
            </div>
          ))
        ) : (
          <div className="no-results-message">
            검색 결과가 없습니다.
          </div>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <div className="footer-nav">
        <button onClick={() => navigate('/home')}>홈 화면</button>
        <button onClick={() => navigate('/record')}>스토리 기록하기</button>
        <button onClick={() => navigate('/memory-plan')}>추억 계획하기</button>
        <button onClick={() => navigate('/mypage')}>마이페이지</button>
      </div>
    </div>
  );
};

export default SearchMemory;
