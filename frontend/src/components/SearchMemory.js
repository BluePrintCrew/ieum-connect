import React, { useState, useEffect } from 'react';
import '../Home.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import FooterNav from './Footernav';

const SearchMemory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [filterOption, setFilterOption] = useState('추천순');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const RESULTS_PER_PAGE = 10;

  // URL에서 검색어 추출 및 상태 업데이트
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('query');
    if (query) {
      setSearchQuery(query);
      fetchSearchResults(query, 1);
    }
  }, [location.search]);

  // 필터 옵션 변경 시 검색 결과 업데이트
  useEffect(() => {
    if (searchQuery) {
      fetchSearchResults(searchQuery, 1);
    }
  }, [filterOption]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const fetchSearchResults = async (query, page) => {
    try {
      const response = await axios.get('/mock/beststories.json', {
        params: {
          hashtag: query,
          sort: filterOption === '추천순' ? 'likes' : 'date',
        },
      });
      const allResults = response.data;
      const total = allResults.length;
      setTotalPages(Math.ceil(total / RESULTS_PER_PAGE));
      setSearchResults(allResults.slice((page - 1) * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE));
      setCurrentPage(page);
    } catch (error) {
      console.error("검색 결과를 가져오는 데 실패했습니다:", error);
    }
  };

  const handlePageChange = (direction) => {
    if (direction === 'prev' && currentPage > 1) {
      fetchSearchResults(searchQuery, currentPage - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      fetchSearchResults(searchQuery, currentPage + 1);
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
            <div key={result.storyId} className="story-item" onClick={() => navigate(`/story/detail/${result.storyId}`)}>
              <span className="story-number">{(currentPage - 1) * RESULTS_PER_PAGE + index + 1}.</span>
              <span className="story-name">{result.title}</span>
              <span className="likes">좋아요 {result.likes}개</span>
            </div>
          ))
        ) : (
          <div className="no-results-message">
            검색 결과가 없습니다.
          </div>
        )}
      </div>

      {/* 페이지 네비게이션 */}
      <div className="pagination-container">
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-button"
              onClick={() => handlePageChange('prev')}
              disabled={currentPage === 1}
            >
              ◀️
            </button>
            <span className="current-page">현재 페이지 {currentPage}</span>
            <button
              className="pagination-button"
              onClick={() => handlePageChange('next')}
              disabled={currentPage === totalPages}
            >
              ▶️
            </button>
          </div>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <FooterNav />
    </div>
  );
};

export default SearchMemory;
