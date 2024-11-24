import React from 'react';
import { useNavigate } from 'react-router-dom';
import '.././MemoryPlanSelect.css';
import FooterNav from './Footernav';

const MemoryPlanSelect = () => {
  const navigate = useNavigate();

  const handleOptionClick = (option) => {
    if (option === 'search') {
      navigate('/search');
    } else if (option === 'mypage') {
      navigate('/mypage');
    }
  };

  return (
    <div className="memory-plan-select-container">
      <h2>추억 계획하기</h2>
      <div className="option" onClick={() => handleOptionClick('search')}>
        1. 검색해서 추억 계획하기
      </div>
      <div className="option" onClick={() => handleOptionClick('mypage')}>
        2. 마이페이지 보기
      </div>
   
    </div>
  );

};

export default MemoryPlanSelect;