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
import PlanRegist from './components/PlanRegist.js';
import './App.css'; // 애니메이션 관련 CSS 포함
import MemoryPlanSelect from './components/MemoryPlanSelect.js';
import StoryPlan from './components/StoryPlan.js';

function AnimatedRoutes() {
  const location = useLocation();
  const excludeFooterNavPaths = ['/login', '/oauth/kakao/callback']; // FooterNav 제외 경로

  return (
    <div className="app-container">
      <main className="main-content">
        <TransitionGroup>
          <CSSTransition key={location.key} classNames="fade" timeout={300}>
            <Routes location={location}>
            <Route path="/login" element={<LoginPage />} />
              <Route path="/oauth/kakao/callback" element={<KakaoCallback />} />
              <Route path="/home" element={<Home />} />
              <Route path="/record" element={<StoryRecord />} />
              <Route path="/search" element={<SearchMemory />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/memory-plan/select" element={<MemoryPlanSelect />} />
              <Route path="/story/detail/:storyId" element={<Detail />} />
              <Route path="/storyplan/:storyId" element={<StoryPlan />} />
              <Route path="/storyplan/regist/:storyId" element={<PlanRegist />} />
            </Routes>
          </CSSTransition>
        </TransitionGroup>
      </main>
      {/* FooterNav를 제외할 경로 처리 */}
      {!excludeFooterNavPaths.includes(location.pathname) && <FooterNav />}
    </div>
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
