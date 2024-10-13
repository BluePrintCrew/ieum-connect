import React from 'react';
import './LoginPage.css';

const LoginPage = () => {
  // 카카오 로그인 처리 함수
  const handleKakaoLogin = () => {
    const REST_API_KEY = process.env.REACT_APP_KAKAO_REST_API_KEY;
    const REDIRECT_URI = process.env.REACT_APP_KAKAO_REDIRECT_URI;
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

    // 카카오 인증 서버로 리디렉션
    window.location.href = kakaoAuthUrl;
  };

  return (
    <div className="login-container">
      <div className="top-container">
        <h1>추억을 [이음]</h1>
        <p>같이 함께 해요</p>
      </div>

      <button className="kakao-button" onClick={handleKakaoLogin}>
        <img src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png" alt="Kakao Login" />
        카카오로 계속하기
      </button>
    </div>
  );
};

export default LoginPage;
