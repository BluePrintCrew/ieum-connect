import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import KakaoMap from '../Kakao/KakaoMap';

const StoryDetail = () => {
  const { storyId } = useParams(); // URL에서 storyId 가져오기
  const [story, setStory] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    // 스토리 정보를 가져오기
    const fetchStory = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/stories/${storyId}`);
        const storyData = response.data;

        // 사진 데이터를 시간 순서대로 정렬
        if (storyData.photos) {
          storyData.photos.sort((a, b) => new Date(a.takenAt) - new Date(b.takenAt));
        }

        setStory(storyData);
        setLikes(storyData.photoCount); // 좋아요 개수 설정
      } catch (error) {
        console.error("글 정보를 가져오는 데 실패했습니다:", error);
      }
    };

    // 댓글 정보를 가져오기
    const fetchComments = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/stories/${storyId}/comments`);
        setComments(response.data);
      } catch (error) {
        console.error("댓글 정보를 가져오는 데 실패했습니다:", error);
      }
    };

    fetchStory();
    fetchComments();
  }, [storyId]);

  const handleLike = async () => {
    try {
      if (!liked) {
        await axios.post(`http://localhost:8080/api/stories/${storyId}/like`);
        setLikes((prevLikes) => prevLikes + 1);
        setLiked(true);
      }
    } catch (error) {
      console.error("좋아요 처리 중 오류 발생:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await axios.post(`http://localhost:8080/api/stories/${storyId}/comments`, {
        content: newComment,
      });
      setComments((prevComments) => [...prevComments, { content: newComment }]);
      setNewComment('');
    } catch (error) {
      console.error("댓글 추가 중 오류 발생:", error);
    }
  };

  if (!story) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="story-detail-container">
      {/* 글 정보 표시 */}
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

      {/* 경로 지도 표시 */}
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
          />
        )}
      </div>

      {/* 좋아요 버튼 및 좋아요 개수 */}
      <div className="like-section">
        <button onClick={handleLike} disabled={liked}>
          {liked ? '좋아요 취소' : '좋아요'}
        </button>
        <span>좋아요 {likes}개</span>
      </div>

      {/* 댓글 섹션 */}
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
