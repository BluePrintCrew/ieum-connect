import React, { useState, useEffect } from 'react';
import '../Home.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import FooterNav from './Footernav';

// Axios 기본 인스턴스를 생성하여 공통 설정
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080', // 백엔드 서버의 기본 URL
  headers: {
    'Content-Type': 'application/json',
  },
});

const SearchMemory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [filterOption, setFilterOption] = useState('추천순');
  const [currentPage, setCurrentPage] = useState(0); // 백엔드 페이지는 0부터 시작
  const [totalPages, setTotalPages] = useState(1);
  const RESULTS_PER_PAGE = 10;

  // URL에서 검색어 추출 및 상태 업데이트
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('query');
    if (query) {
      setSearchQuery(query);
      fetchSearchResults(query, 0); // 페이지 번호 0으로 변경
    }
  }, [location.search]);

  // 필터 옵션 변경 시 검색 결과 업데이트
  useEffect(() => {
    if (searchQuery) {
      fetchSearchResults(searchQuery, 0);
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
      console.log('요청 URL:', '/api/stories/search');
      console.log('요청 파라미터:', {
        hashtag: query,
        page: page,
        size: RESULTS_PER_PAGE,
        sort: filterOption === '추천순' ? 'likeCount' : 'createdAt',
        direction: 'desc',
      });
  
      const response = await axiosInstance.get('/api/stories/search', {
        params: {
          hashtag: encodeURIComponent(query),
          page: page,
          size: RESULTS_PER_PAGE,
          sort: filterOption === '추천순' ? 'likeCount' : 'createdAt',
          direction: 'desc',
        },
      });
      const data = response.data;
      setTotalPages(data.totalPages);
      setSearchResults(data.content);
      setCurrentPage(page);
    } catch (error) {
      // 오류 발생 시 에러 정보 출력
      console.error('검색 결과를 가져오는 데 실패했습니다:', error);
      if (error.response) {
        console.error('응답 상태:', error.response.status);
        console.error('응답 데이터:', error.response.data);
      } else if (error.request) {
        console.error('요청이 만들어졌지만 응답을 받지 못했습니다:', error.request);
      } else {
        console.error('오류 메시지:', error.message);
      }
    }
  }; 

  const handlePageChange = (direction) => {
    if (direction === 'prev' && currentPage > 0) {
      fetchSearchResults(searchQuery, currentPage - 1);
    } else if (direction === 'next' && currentPage < totalPages - 1) {
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

      {/* 필터 옵션과 현재 페이지 번호 */}
      <div className="filter-options-container">
        <div className="current-page-number">페이지 {currentPage + 1}</div>
        <div className="filter-options">
          <button
            className="pagination-button"
            onClick={() => handlePageChange('prev')}
            disabled={currentPage === 0}
          >
            ◀️
          </button>
          <select value={filterOption} onChange={(e) => setFilterOption(e.target.value)}>
            <option value="추천순">추천순</option>
            <option value="최신순">최신순</option>
          </select>
          <button
            className="pagination-button"
            onClick={() => handlePageChange('next')}
            disabled={currentPage === totalPages - 1}
          >
            ▶️
          </button>
        </div>
      </div>

      {/* 검색 결과 리스트 */}
      <div className="search-results">
        {searchResults.length > 0 ? (
          searchResults.map((result, index) => (
            <div key={result.storyId} className="story-item" onClick={() => navigate(`/story/detail/${result.storyId}`)}>
              <span className="story-number">{currentPage * RESULTS_PER_PAGE + index + 1}.</span>
              <span className="story-name">{result.title}</span>
              <span className="likes">좋아요 {result.likeCount}개</span>
            </div>
          ))
        ) : (
          <div className="no-results-message">
            검색 결과가 없습니다.
          </div>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <FooterNav />
    </div>
  );
};

export default SearchMemory;
