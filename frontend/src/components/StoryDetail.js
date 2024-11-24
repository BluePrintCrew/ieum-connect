// StoryDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useNavigate 추가
import axios from 'axios';
import KakaoMap from '../Kakao/KakaoMap';
import '../storydetail.css';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import CantFollowing from './CantFollowing'; // 모달 컴포넌트 임포트

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

const StoryDetail = () => {
  const { storyId } = useParams();
  const currentUserId = parseInt(JSON.parse(localStorage.getItem('user'))?.userId, 10);
  const navigate = useNavigate(); // navigate 초기화

  const [story, setStory] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [routePoints, setRoutePoints] = useState([]); // 추가된 상태 변수
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(null);
  const [likes, setLikes] = useState(0);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 창 상태

  useEffect(() => {
    // 스토리 정보를 가져오기
    const fetchStory = async () => {
      setLoading(true);
      setError('');
      try {
        // currentUserId를 포함한 API 요청
        const response = await axiosInstance.get(`/api/stories/${storyId}`, {
          params: {
            currentUserId,
          },
        });
        const storyData = response.data;

        if (storyData) {
          // 각 상태 변수 업데이트
          setStory(storyData);
          setLikes(storyData.likeCount);
          setComments(storyData.comments || []);
          setLiked(storyData.liked);
          setFollowing(storyData.following);

          // routePoints 상태 업데이트
          const points = storyData.route?.routePoints || [];
          setRoutePoints(points);

          // 스토리의 사진 데이터를 개별적으로 가져오기
          const photoPromises = storyData.photos.map((photo) =>
            axiosInstance.get(`/api/photos/${photo.photoId}`, {
              responseType: 'blob',
            })
          );
          const photoResponses = await Promise.all(photoPromises);
          const photoData = photoResponses.map((res, index) => {
            const { latitude, longitude } = storyData.photos[index];
            return {
              photoUrl: URL.createObjectURL(res.data),
              photoId: res.config.url.split('/').pop(),
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude),
            };
          });
          setPhotos(photoData);
        } else {
          setError('해당 스토리를 찾을 수 없습니다.');
        }
      } catch (err) {
        setError('스토리 정보를 가져오는 데 실패했습니다.');
        console.error('스토리 정보를 가져오는 데 실패했습니다:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [storyId, currentUserId]);

  const handleLike = async () => {
    try {
      setError('');

      if (!liked) {
        // 좋아요 추가 요청
        const response = await axiosInstance.post('/api/likes', {
          storyId: parseInt(storyId, 10),
          userId: currentUserId,
        });
        if (response.status === 200) {
          setLikes((prevLikes) => prevLikes + 1);
          setLiked(true);
        }
      } else {
        // 좋아요 취소 요청
        const params = {
          userId: currentUserId,
          storyId: parseInt(storyId, 10),
        };

        await axiosInstance.delete('/api/likes', { params });

        setLikes((prevLikes) => Math.max(prevLikes - 1, 0));
        setLiked(false);
      }
    } catch (error) {
      setError('좋아요 처리에 실패했습니다.');
      console.error('좋아요 추가/취소에 실패했습니다:', error);
    }
  };

  const handleFollow = async () => {
    try {
      setError('');

      if (!following) {
        // 자신을 팔로우하려는 경우 모달 창 표시
        if (story.user.userId === currentUserId) {
          setIsModalOpen(true);
          return;
        }

        // 팔로우 추가 요청
        const response = await axiosInstance.post('/api/follows', {
          followerId: currentUserId,
          followingId: story.user.userId,
        });
        if (response.status === 200) {
          setFollowing(true);
        }
      } else {
        // 팔로우 취소 요청
        const response = await axiosInstance.delete('/api/follows', {
          data: {
            followerId: currentUserId,
            followingId: story.user.userId,
          },
        });
        if (response.status === 200) {
          setFollowing(false);
        }
      }
    } catch (error) {
      setError('팔로우 처리에 실패했습니다.');
      console.error('팔로우 추가/취소에 실패했습니다:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setError('');

      const response = await axiosInstance.post('/api/comments', {
        storyId: parseInt(storyId, 10),
        userId: currentUserId,
        content: newComment,
      });
      if (response.status === 200) {
        setComments((prevComments) => [
          ...prevComments,
          {
            content: newComment,
            username: response.data.username || '사용자',
            createdAt: new Date().toISOString(),
          },
        ]);
        setNewComment('');
      }
    } catch (error) {
      setError('댓글 추가에 실패했습니다.');
      console.error('댓글 추가에 실패했습니다:', error);
    }
  };

  const handleReference = () => {
    navigate(`/storyplan/${storyId}`);
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="story-detail-container">
      <h1 className="story-title">{story.title}</h1>
      <div className="story-info">
        <span>작성자: {story.user.username}</span>
        <span>작성일: {new Date(story.createdAt).toLocaleString()}</span>
      </div>

      <div className="story-content">{story.description}</div>

      <div className="story-map">
        <h2>경로 지도</h2>
        {routePoints.length > 0 && (
          <KakaoMap
            isSpotAdding={false}
            markers={routePoints.map((point) => ({
              lat: point.latitude,
              lng: point.longitude,
            }))}
            setMarkers={() => {}}
            center={
              !isNaN(routePoints[0].latitude) && !isNaN(routePoints[0].longitude)
                ? { lat: routePoints[0].latitude, lng: routePoints[0].longitude }
                : { lat: 37.283, lng: 127.046 }
            }
          />
        )}
      </div>

      {photos && photos.length > 0 && (
        <div className="story-photos">
          <Slider {...sliderSettings}>
            {photos.map((photo) => (
              <div key={photo.photoId} className="photo-item">
                <img src={photo.photoUrl} alt="스토리 사진" />
              </div>
            ))}
          </Slider>
        </div>
      )}

      {/* 좋아요, 팔로우, 따라하기 버튼이 같은 행에 위치하도록 수정 */}
      <div className="interaction-section">
        <div className="like-section">
          <button className="like-button" onClick={handleLike}>
            {liked ? '좋아요 취소' : '좋아요'}
          </button>
          <span>좋아요 {likes}개</span>
        </div>
        <button className="follow-button" onClick={handleFollow}>
          {following ? '팔로우 취소' : '팔로우'}
        </button>
        <button className="reference-button" onClick={handleReference}>
          따라하기
        </button>
      </div>

      <div className="preference-container">
        {[1, 2, 3].map((level) => (
          <span
            key={level}
            className={`preference-icon ${story.preference >= level ? 'active' : ''}`}
          >
            {story.preference >= level ? '❤️' : '♡'}
          </span>
        ))}
      </div>

      <div className="hashtag-container">
        {story.hashtags.map((hashtag, index) => (
          <span key={index} className="hashtag">{`#${hashtag}`}</span>
        ))}
      </div>

      <div className="comments-section">
        <h3>댓글</h3>
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} className="comment">
              <span>
                {comment.username || '익명 사용자'}: {comment.content}
              </span>
            </div>
          ))
        ) : (
          <p>댓글이 없습니다.</p>
        )}
        <div className="add-comment">
          <input
            type="text"
            placeholder="댓글을 입력하세요"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button onClick={handleAddComment}>댓글 달기</button>
        </div>
      </div>

      {/* 자신을 팔로우하려는 경우 모달 창 */}
      <CantFollowing isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default StoryDetail;
