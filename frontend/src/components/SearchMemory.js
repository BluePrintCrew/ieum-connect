import React, { useState, useEffect } from 'react';
import '../Home.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import FooterNav from './Footernav';
import StoryItem from './StoryItem';



 
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
  const [searchResults, setSearchResults] = useState([]); // 빈 배열로 초기화
  const [filterOption, setFilterOption] = useState('추천순');
  const [currentPage, setCurrentPage] = useState(0); // 백엔드 페이지는 0부터 시작
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

const [nickname, setNickname] = useState('');
  const RESULTS_PER_PAGE = 10;
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
    setIsLoading(true);
    setErrorMessage('');
    try {
      console.log('검색 요청 시작:', { query, page, filterOption });
      const response = await axiosInstance.get('/api/stories/search', {
        params: {
          hashtag: query, // 인코딩 제거
          page: page,
          size: RESULTS_PER_PAGE,
          sort: filterOption === '추천순' ? 'likeCount' : 'createdAt',
          direction: 'desc',
        },
      });
      console.log('검색 요청 성공:', response.data);
      const data = response.data;
      setTotalPages(data.totalPages);
      setSearchResults(data.content || []); // 데이터가 없을 경우 빈 배열로 설정
      setCurrentPage(page);
    } catch (error) {
      setErrorMessage('검색 결과를 가져오는 데 실패했습니다. 다시 시도해주세요.');
      console.error('검색 요청 중 오류 발생:', error);
    } finally {
      setIsLoading(false);
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
      <div className="header">
        <div className="nickname">{nickname}</div>
        
        <div className="settings-icon" onClick={() => navigate('/settings')}>⚙️ 설정</div>
      </div>
      

      <div className="search-bar">
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
        />
      </div>

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

      <div className="search-results">
        {isLoading ? (
          <div className="loading-message">로딩 중...</div>
        ) : errorMessage ? (
          <div className="error-message">{errorMessage}</div>
        ) : searchResults && searchResults.length > 0 ? (
          searchResults.map((result, index) => (
            <StoryItem
              key={result.storyId}
              story={result}
              index={currentPage * RESULTS_PER_PAGE + index + 1}
              onClick={() => navigate(`/story/detail/${result.storyId}`)}
            />
          ))
        ) : (
          <div className="no-results-message">
          <img src="images/noresult.png" alt="No results" />
          검색 결과가 없습니다.
        </div> 
        )}
      </div>

 
    </div>
  );
};

export default SearchMemory;
