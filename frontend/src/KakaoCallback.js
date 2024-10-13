import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const KakaoCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 현재 URL에서 인증 코드를 가져옵니다.
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      // 인증 코드를 백엔드로 전송하여 액세스 토큰을 요청합니다.
      axios.post('/api/kakao/callback', { code })
        .then(response => {
          // 로그인 성공 처리
          const { token, user } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));

          // 홈 화면으로 리디렉트
          navigate('/');
        })
        .catch(error => {
          console.error('카카오 로그인 실패:', error);
          // 로그인 실패 시 처리 (예: 에러 메시지 출력)
        });
    }
  }, [navigate]);

  return <div>카카오 로그인 중...</div>;
};

export default KakaoCallback;
