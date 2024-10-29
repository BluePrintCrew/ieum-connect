import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../FooterNav.css';

const FooterNav = () => {
  const navigate = useNavigate();

  return (
    <div className="footer-nav">
      <button onClick={() => navigate('/home')}>홈</button>
      <button onClick={() => navigate('/record')}>스토리<br></br>기록하기</button>
      <button onClick={() => navigate('/memory-plan')}>추억<br></br>계획하기</button>
      <button onClick={() => navigate('/mypage')}>마이<br></br>페이지</button>
    </div>
  );
};

export default FooterNav;
