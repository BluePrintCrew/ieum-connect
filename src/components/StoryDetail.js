/* storydetail.js */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import KakaoMap from '../Kakao/KakaoMap';
import '../storydetail.css';

const StoryDetail = () => {
  const { storyId } = useParams(); 
  const [story, setStory] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    // 스토리 정보를 가져오기
    const fetchStory = async () => {
      try {
        const response = await axios.get(`/mock/stories.json`);
        const storyData = response.data.find((s) => s.storyId === parseInt(storyId));
        
        if (storyData) {
          storyData.photos.sort((a, b) => new Date(a.takenAt) - new Date(b.takenAt));
          setStory(storyData);
          setLikes(storyData.likes);
          setComments(storyData.comments);
        } else {
          console.error("해당 스토리를 찾을 수 없습니다.");
        }
      } catch (error) {
        console.error("스토리 정보를 가져오는 데 실패했습니다:", error);
      }
    };

    fetchStory();
  }, [storyId]);

  const handleLike = () => {
    if (!liked) {
      setLikes((prevLikes) => prevLikes + 1);
      setLiked(true);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    setComments((prevComments) => [...prevComments, { content: newComment }]);
    setNewComment('');
  };

  if (!story) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="story-detail-container">
      <h1 className="story-title">{story.title}</h1>
      <div className="story-info">
        <span>작성자: {story.user.username}</span>
        <span>작성일: {story.createdAt}</span>
      </div>
      <div className="story-content">{story.description}</div>

      {/* 이미지 슬라이드 */}
      {story.photos && (
        <div className="story-photos">
          {story.photos.map((photo) => (
            <div key={photo.photoId} className="photo-item">
              <img src={photo.filePath} alt="스토리 사진" />
              <span>찍은 시간: {photo.takenAt}</span>
            </div>
          ))}
        </div>
      )}

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
            center={story.photos.length > 0 ? { lat: story.photos[0].latitude, lng: story.photos[0].longitude } : { lat: 37.283, lng: 127.046 }}
          />
        )}
      </div>

      <div className="like-section">
        <button onClick={handleLike} disabled={liked}>
          {liked ? '좋아요 취소' : '좋아요'}
        </button>
        <span>좋아요 {likes}개</span>
      </div>

      <div className="preference-container">
        {[1, 2, 3].map((level) => (
          <span key={level} className={`preference-icon ${story.preference >= level ? 'active' : ''}`}>
            {story.preference >= level ? '❤️' : '♡'}
          </span>
        ))}
      </div>

      <div className="hashtag-container">
        {story.hashtags.map((hashtag, index) => (
          <span key={index} className="hashtag">{hashtag}</span>
        ))}
      </div>

      <div className="comments-section">
        <h3>댓글</h3>
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} className="comment">
              <span>{comment.content}</span>
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
