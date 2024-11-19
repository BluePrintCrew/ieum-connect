import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const KakaoCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 현재 URL에서 인증 코드를 가져옵니다.
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    // 인증 코드가 있는지 확인
    if (code) {
      console.log('인증 코드:', code);

      // 인증 코드를 백엔드로 전송하여 액세스 토큰과 사용자 정보를 요청합니다.
      axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/kakao`, { code })
        .then(response => {
          // 백엔드에서 반환된 로그인 성공 정보를 처리
          console.log('백엔드 응답 데이터:', response.data);
          const { userId, nickname, username } = response.data;

          // 로컬 스토리지에 사용자 정보 저장
          localStorage.setItem('user', JSON.stringify({ userId, nickname, username }));

          // 로컬 스토리지에 저장된 데이터 확인
          const savedUser = localStorage.getItem('user');
          console.log('로컬 스토리지에 저장된 사용자 정보:', savedUser);

          // 홈 화면으로 리디렉트는 일단 보류
          navigate('/');
        })
        .catch(error => {
          console.error('카카오 로그인 실패:', error);
          // 로그인 실패 시 처리 (예: 에러 메시지 출력 및 로그인 페이지로 리디렉트)
          alert('로그인에 실패했습니다. 다시 시도해 주세요.');
          navigate('/login');
        });
    } else {
      console.error('인증 코드가 없습니다. 로그인 페이지로 리디렉트합니다.');
      // 인증 코드가 없을 경우 로그인 페이지로 이동
      navigate('/login');
    }
  }, [navigate]);

  return <div>카카오 로그인 중...</div>;
};

export default KakaoCallback;
