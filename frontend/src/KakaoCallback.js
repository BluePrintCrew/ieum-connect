import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const KakaoCallback = () => {
  const navigate = useNavigate();
  const BACKEND_URL = 'http://localhost:8080';

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      console.log('1. 인증 코드 확인:', code);

      axios.post('https://kauth.kakao.com/oauth/token', null, {
        params: {
          grant_type: 'authorization_code',
          client_id: process.env.REACT_APP_KAKAO_REST_API_KEY,
          redirect_uri: process.env.REACT_APP_KAKAO_REDIRECT_URI,
          code: code,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      })
          .then(tokenResponse => {
            console.log('2. 토큰 응답 확인:', tokenResponse.data);
            return axios.get('https://kapi.kakao.com/v2/user/me', {
              headers: {
                'Authorization': `Bearer ${tokenResponse.data.access_token}`,
              },
            });
          })
          .then(userResponse => {
            console.log('3. 사용자 정보 응답:', userResponse.data);
            const kakaoId = userResponse.data.id.toString();
            const idSuffix = kakaoId.substring(kakaoId.length - 3);
            const nickname = `사용자_${idSuffix}`;

            // 백엔드 요청 데이터 로깅
            console.log('4. 백엔드로 전송할 데이터:', {
              kakaoId,
              nickname
            });

            // CORS 관련 설정 추가
            return axios.post(`${BACKEND_URL}/api/auth/kakao`, {
              kakaoId: kakaoId,
              nickname: nickname
            }, {
              headers: {
                'Content-Type': 'application/json',
              },
              withCredentials: true // CORS 관련 설정
            });
          })
          .then(response => {
            console.log('5. 백엔드 응답 성공:', response.data);
            const { userId } = response.data;

            localStorage.setItem('user', JSON.stringify({
              userId,
              nickname: `사용자_${userId.toString().slice(-3)}`,
              username: `user_${userId.toString().slice(-3)}`
            }));

            console.log('6. 로그인 완료, 저장된 사용자 정보:',
                JSON.parse(localStorage.getItem('user'))
            );

            navigate('/home');
          })
          .catch(error => {
            console.error('오류 발생 위치 확인:', {
              message: error.message,
              config: error.config,
              response: error.response?.data,
              status: error.response?.status
            });

            alert('로그인에 실패했습니다. 다시 시도해 주세요.');
            navigate('/login');
          });
    } else {
      console.error('인증 코드가 없습니다.');
      navigate('/login');
    }
  }, [navigate]);

  return <div>카카오 로그인 처리 중...</div>;
};

export default KakaoCallback;