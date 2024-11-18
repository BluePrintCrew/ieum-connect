import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import KakaoMap from '../Kakao/KakaoMap';
import '../storydetail.css';
import Slider from 'react-slick'; // react-slick 임포트
import 'slick-carousel/slick/slick.css'; // CSS 임포트
import 'slick-carousel/slick/slick-theme.css'; // CSS 임포트

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080', // 백엔드 서버의 기본 URL
  headers: {
    'Content-Type': 'application/json',
  },
});

const StoryDetail = () => {
  const { storyId } = useParams();
  const [story, setStory] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeId, setLikeId] = useState(null); // likeId 저장
  const [likes, setLikes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 스토리 정보를 가져오기
    const fetchStory = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axiosInstance.get(`/api/stories/${storyId}`);
        const storyData = response.data;

        if (storyData) {
          if (storyData.photos) {
            storyData.photos.sort((a, b) => new Date(a.takenAt) - new Date(b.takenAt));
          }
          setStory(storyData);
          setLikes(storyData.likeCount);
          setComments(storyData.comments || []);
          setLiked(storyData.likedByUser);

          if (storyData.likedByUser) {
            const likeResponse = await axiosInstance.get(`/api/likes/story/${storyId}`);
            if (likeResponse.status === 200) {
              setLikeId(likeResponse.data.likeId); // likeId 설정
            }
          }
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
  }, [storyId]);

  const handleLike = async () => {
    try {
      if (!liked) {
        const response = await axiosInstance.post('/api/likes', {
          storyId: parseInt(storyId),
          userId: 1,
        });
        if (response.status === 200) {
          setLikes((prevLikes) => prevLikes + 1);
          setLiked(true);
          setLikeId(response.data.likeId); // likeId 설정
        }
      } else {
        if (likeId) {
          const response = await axiosInstance.delete(`/api/likes/${likeId}`);
          if (response.status === 200) {
            setLikes((prevLikes) => Math.max(prevLikes - 1, 0));
            setLiked(false);
            setLikeId(null); // 좋아요 취소 후 likeId 초기화
          }
        } else {
          setError('좋아요 ID를 찾을 수 없습니다.');
        }
      }
    } catch (error) {
      setError('좋아요 처리에 실패했습니다.');
      console.error('좋아요 추가/취소에 실패했습니다:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await axiosInstance.post('/api/comments', {
        storyId: parseInt(storyId),
        userId: 1,
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
      </div>
      <div className="story-content">{story.description}</div>

      <div className="story-map">
        <h2>경로 지도</h2>
        {story.photos && (
          <KakaoMap
            isSpotAdding={false}
            markers={story.photos.map((photo) => ({
              lat: photo.latitude,
              lng: photo.longitude,
            }))}
            setMarkers={() => {}}
            center={
              story.photos.length > 0
                ? { lat: story.photos[0].latitude, lng: story.photos[0].longitude }
                : { lat: 37.283, lng: 127.046 }
            }
          />
        )}
      </div>

      {story.photos && (
        <div className="story-photos">
          <Slider {...sliderSettings}>
            {story.photos.map((photo) => (
              <div key={photo.photoId} className="photo-item">
                <img src={`http://localhost:8080${photo.filePath}`} alt="스토리 사진" />
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
