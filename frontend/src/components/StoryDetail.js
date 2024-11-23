import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import KakaoMap from '../Kakao/KakaoMap';
import '../storydetail.css';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

const StoryDetail = () => {
  const { storyId } = useParams();
  const userId = parseInt(JSON.parse(localStorage.getItem('user'))?.userId);
  
  // useState를 사용하여 liked와 other 상태 초기화
  const [story, setStory] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(null); // 초기값을 false로 설정하고 나중에 업데이트함
  const [likes, setLikes] = useState(0);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 스토리 정보를 가져오기
    const fetchStory = async () => {
      setLoading(true);
      setError('');
      try {
        // currentUserId를 포함한 API 요청
        const response = await axiosInstance.get(`/api/stories/${storyId}`, {
          params: {
            currentUserId: userId,
          },
        });
        const storyData = response.data;

        if (storyData) {
          // 각 상태 변수 업데이트
          setStory(storyData);
          setLikes(storyData.likeCount);
          setComments(storyData.comments || []);
          setLiked(storyData.liked); // 백엔드에서 받은 isLiked 값을 상태 변수로 설정
          setFollowing(storyData.following);

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
  }, [storyId, userId]); // storyId와 userId가 변경될 때마다 useEffect가 실행

  const handleLike = async () => {
    try {
      setError('');

      if (!liked) {
        // 좋아요 추가 요청
        const response = await axiosInstance.post('/api/likes', {
          storyId: parseInt(storyId),
          userId: userId,
        });
        if (response.status === 200) {
          setLikes((prevLikes) => prevLikes + 1);
          setLiked(true);
        }
      } else {
        // 좋아요 취소 요청
        const params = {
          userId: userId,
          storyId: parseInt(storyId),
        };
        
        console.log(`http://localhost:8080/api/likes?userId=${params.userId}&storyId=${params.storyId}`); // 실제 요청 URL 출력
        
        const response = await axiosInstance.delete('/api/likes', { params });
        
        if (response.status === 200) {
          setLikes((prevLikes) => Math.max(prevLikes - 1, 0));
          setLiked(false);
        }
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
        // 팔로우 추가 요청
        const response = await axiosInstance.post('/api/follows', {
          followerId: userId,
          followingId: story.user.userId,
        });
        if (response.status === 200) {
          setFollowing(true);
        }
      } else {
        // 팔로우 취소 요청
        const response = await axiosInstance.delete('/api/follows', {
          data: {
            followerId: userId,
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
        storyId: parseInt(storyId),
        userId: userId,
        content: newComment,
      });
      if (response.status === 200) {
        setComments((prevComments) => [
          ...prevComments,
          { content: newComment, username: '사용자', createdAt: new Date().toISOString() },
        ]);
        setNewComment('');
      }
    } catch (error) {
      setError('댓글 추가에 실패했습니다.');
      console.error('댓글 추가에 실패했습니다:', error);
    }
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
        <button className="reference-button">따라하기</button>
      </div>

      <div className="story-content">{story.description}</div>

      <div className="story-map">
        <h2>경로 지도</h2>
        {photos && (
          <KakaoMap
            isSpotAdding={false}
            markers={photos
              .filter((photo) => !isNaN(photo.latitude) && !isNaN(photo.longitude))
              .map((photo) => ({
                lat: photo.latitude,
                lng: photo.longitude,
              }))}
            setMarkers={() => {}}
            center={
              photos.length > 0 && !isNaN(photos[0].latitude) && !isNaN(photos[0].longitude)
                ? { lat: photos[0].latitude, lng: photos[0].longitude }
                : { lat: 37.283, lng: 127.046 }
            }
          />
        )}
      </div>

      {photos && (
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

      <div className="like-section">
        <button onClick={handleLike}>
          {liked ? '좋아요 취소' : '좋아요'}
        </button>
        <span>좋아요 {likes}개</span>
        <button className="follow-button" onClick={handleFollow}>
          {following ? '팔로우 취소' : '팔로우'}
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
              <span>{comment.username || '익명 사용자'}: {comment.content}</span>
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
    </div>
  );
};

export default StoryDetail;
