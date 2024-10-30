import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import KakaoMap from '../Kakao/KakaoMap';
import '../storydetail.css';

const StoryDetail = () => {
  const { storyId } = useParams(); // URL에서 storyId 가져오기
  const [story, setStory] = useState({
    title: '임시 제목',
    user: { username: '임시 작성자' },
    createdAt: '2024-10-29',
    description: '임시 설명입니다. 여기에 스토리 내용이 들어갑니다.',
    photos: [
      {
        photoId: 1,
        filePath: 'https://via.placeholder.com/150',
        takenAt: '2024-10-29T10:00:00',
        latitude: 37.564991,
        longitude: 126.983937,
      },
      {
        photoId: 2,
        filePath: 'https://via.placeholder.com/150',
        takenAt: '2024-10-29T10:30:00',
        latitude: 37.566158,
        longitude: 126.988940,
      },
    ],
    hashtags: ['#여행', '#맛집', '#산책'],
    preference: 2,
  });
  const [comments, setComments] = useState([
    { content: '임시 댓글 1' },
    { content: '임시 댓글 2' },
  ]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(10);

  useEffect(() => {
    // 스토리 정보를 가져오기
    // const fetchStory = async () => {
    //   try {
    //     const response = await axios.get(`http://localhost:8080/api/stories/${storyId}`);
    //     const storyData = response.data;

    //     // 사진 데이터를 시간 순서대로 정렬
    //     if (storyData.photos) {
    //       storyData.photos.sort((a, b) => new Date(a.takenAt) - new Date(b.takenAt));
    //     }

    //     setStory(storyData);
    //     setLikes(storyData.photoCount); // 좋아요 개수 설정
    //   } catch (error) {
    //     console.error("글 정보를 가져오는 데 실패했습니다:", error);
    //   }
    // };

    // 댓글 정보를 가져오기
    // const fetchComments = async () => {
    //   try {
    //     const response = await axios.get(`http://localhost:8080/api/stories/${storyId}/comments`);
    //     setComments(response.data);
    //   } catch (error) {
    //     console.error("댓글 정보를 가져오는 데 실패했습니다:", error);
    //   }
    // };

    // fetchStory();
    // fetchComments();
  }, [storyId]);

  const handleLike = async () => {
    try {
      if (!liked) {
        // await axios.post(`http://localhost:8080/api/stories/${storyId}/like`);
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
      // await axios.post(`http://localhost:8080/api/stories/${storyId}/comments`, {
      //   content: newComment,
      // });
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
          {liked ? '좋아요' : '좋아요'}
        </button>
        <span>좋아요 {likes}개</span>
      </div>

      {/* 선호도 표시 */}
      <div className="preference-container">
        {[1, 2, 3].map((level) => (
          <span key={level} className={`preference-icon ${story.preference >= level ? 'active' : ''}`}>
            {story.preference >= level ? '❤️' : '♡'}
          </span>
        ))}
      </div>

      {/* 해시태그 표시 */}
      <div className="hashtag-container">
        {story.hashtags.map((hashtag, index) => (
          <span key={index} className="hashtag">{hashtag}</span>
        ))}
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
