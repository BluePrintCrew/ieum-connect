import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import StoryRecord from './components/StoryRecord';
import LoginPage from './LoginPage';
import KakaoCallback from './KakaoCallback';
import Home from './components/Home.js';
import SearchMemory from './components/SearchMemory.js';
import MyPage from './components/Mypage.js';
import FooterNav from './components/Footernav';
import Detail from './components/StoryDetail.js';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<><Home /></>} />
        <Route path="/login" element={<LoginPage />} /> 
        <Route path="/record" element={<><StoryRecord /></>} />
        <Route path="/search" element={<><SearchMemory /></>} />
        <Route path="/mypage" element={<><MyPage /></>} /> 
      <Route path="/story/detail/:storyId" element={<><Detail /><FooterNav /></>} /> 
        {/*<Route path="/detail" element={<><Detail /><FooterNav /></>} /> */}
        <Route path="/oauth/kakao/callback" element={<KakaoCallback />} /> {/*redirect */}
        {/* 
        <Route path="/share" element={<MemoryShare />} />
        <Route path="/search" element={<MemorySearch />} />
        <Route path="/plan" element={<MemoryPlan />} />
        */}
      </Routes>
    </Router>
  );
}

export default App;
