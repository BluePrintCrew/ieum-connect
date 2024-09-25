import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import StoryRecord from './components/StoryRecord';
import LoginPage from './LoginPage';
import KakaoCallback from './KakaoCallback';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage/>} /> 
        <Route path="/record" element={<StoryRecord />} />
        <Route path="/oauth/kakao/callback" element={<KakaoCallback/>} /> {/*redirect */}
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
