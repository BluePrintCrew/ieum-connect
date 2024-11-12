import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import StoryRecord from './components/StoryRecord';
import LoginPage from './LoginPage';
import KakaoCallback from './KakaoCallback';
import Home from './components/Home.js';
import SearchMemory from './components/SearchMemory.js';
import MyPage from './components/Mypage.js';
import FooterNav from './components/Footernav';
import Detail from './components/StoryDetail.js';
import './App.css'; // 애니메이션 관련 CSS 포함

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <TransitionGroup>
      <CSSTransition key={location.key} classNames="fade" timeout={300}>
        <Routes location={location}>
          <Route path="/home" element={<><Home /></>} />
          <Route path="/login" element={<LoginPage />} /> 
          <Route path="/record" element={<><StoryRecord /></>} />
          <Route path="/search" element={<><SearchMemory /></>} />
          <Route path="/mypage" element={<><MyPage /></>} /> 
          <Route path="/story/detail/:storyId" element={<><Detail /><FooterNav /></>} /> 
          <Route path="/oauth/kakao/callback" element={<KakaoCallback />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
