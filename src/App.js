import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import StoryRecord from './components/StoryRecord';
import LoginPage from './LoginPage';
import KakaoCallback from './KakaoCallback';
import Home from './components/Home.js';
import SearchMemory from './components/SearchMemory.js';
import MyPage from './components/Mypage.js';
import FooterNav from './components/Footernav';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<><Home /><FooterNav /></>} />
        <Route path="/login" element={<LoginPage />} /> 
        <Route path="/record" element={<><StoryRecord /><FooterNav /></>} />
        <Route path="/search" element={<><SearchMemory /><FooterNav /></>} />
        <Route path="/mypage" element={<><MyPage /><FooterNav /></>} /> 
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
