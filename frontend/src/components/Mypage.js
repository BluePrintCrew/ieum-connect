import React, { useState, useEffect } from 'react';
import '../Mypage.css';
import { useNavigate } from 'react-router-dom';
import FooterNav from './Footernav';
import axios from 'axios';
// AuthContext를 통해 로그인된 사용자 정보 가져오기
// import { AuthContext } from '../AuthContext';

const MyPage = () => {
  const navigate = useNavigate();
  
  // AuthContext에서 가져오는 부분을 주석 처리
  // const { user } = useContext(AuthContext);
  // const userId = user?.userId;

  // 임시로 userId와 username을 직접 설정
  const userId = 1; // 예시 ID
  const username = '닉네임'; // 예시 닉네임

  const [myStories, setMyStories] = useState([]);
  const [myStoriesPage, setMyStoriesPage] = useState(0);
  const [myStoriesTotalPages, setMyStoriesTotalPages] = useState(0);

  const [likedStories, setLikedStories] = useState([]);
  const [likedStoriesPage, setLikedStoriesPage] = useState(0);
  const [likedStoriesTotalPages, setLikedStoriesTotalPages] = useState(0);

  const PAGE_SIZE = 10;

  // 나의 추억 모음 데이터 가져오기
  const fetchMyStories = async () => {
    try {
      const response = await axios.get(`/api/stories/member/${userId}`, {
        params: {
          page: myStoriesPage,
          size: PAGE_SIZE,
        },
      });
      setMyStories(response.data.content);
      setMyStoriesTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('나의 추억 데이터를 가져오는 중 오류 발생:', error);
    }
  };

  // 좋아요 한 스토리 데이터 가져오기
  const fetchLikedStories = async () => {
    try {
      const response = await axios.get(`/api/likes/member/${userId}`, {
        params: {
          page: likedStoriesPage,
          size: PAGE_SIZE,
        },
      });
      setLikedStories(response.data.content);
      setLikedStoriesTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('좋아요 한 스토리 데이터를 가져오는 중 오류 발생:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMyStories();
      fetchLikedStories();
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchMyStories();
    }
  }, [myStoriesPage]);

  useEffect(() => {
    if (userId) {
      fetchLikedStories();
    }
  }, [likedStoriesPage]);

  const handleDeleteStory = async (storyId) => {
    if (window.confirm('정말로 이 스토리를 삭제하시겠습니까?')) {
      try {
        await axios.delete(`/api/stories/${storyId}`);
        setMyStories((prevStories) =>
          prevStories.filter((story) => story.storyId !== storyId)
        );
      } catch (error) {
        console.error('스토리 삭제 중 오류 발생:', error);
        alert('스토리 삭제에 실패했습니다.');
      }
    }
  };

  return (
    <div className="mypage-container">
      {/* 상단: 닉네임과 프로필 편집 */}
      <div className="profile-edit-container">
        <div className="nickname" style={{ textAlign: 'left' }}>
          {username || '닉네임'}
        </div>
        <button className="profile-edit-button" onClick={() => navigate('/edit-profile')}>
          프로필 편집
        </button>
      </div>

      {/* 나의 추억 모음 */}
      <h2 className="mypage-title">나의 추억 모음</h2>
      {myStories.length > 0 ? (
        <>
          <ul className="memory-list">
            {myStories.map((story) => (
              <li key={story.storyId} className="memory-item">
                <span
                  className="memory-title"
                  onClick={() => navigate(`/story/detail/${story.storyId}`)}
                >
                  {story.title}
                </span>
                <span className="likes">좋아요 {story.likeCount}개</span>
                <button
                  className="edit-button"
                  onClick={() => navigate(`/story/edit/${story.storyId}`)}
                >
                  수정
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteStory(story.storyId)}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
          {/* 페이지 네비게이션 */}
          {myStoriesTotalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setMyStoriesPage((prev) => Math.max(prev - 1, 0))}
                disabled={myStoriesPage === 0}
              >
                이전
              </button>
              <span>
                {myStoriesPage + 1} / {myStoriesTotalPages}
              </span>
              <button
                onClick={() =>
                  setMyStoriesPage((prev) =>
                    prev + 1 < myStoriesTotalPages ? prev + 1 : prev
                  )
                }
                disabled={myStoriesPage + 1 >= myStoriesTotalPages}
              >
                다음
              </button>
            </div>
          )}
        </>
      ) : (
        <p>아직 작성한 추억이 없습니다.</p>
      )}

      {/* 좋아요 한 스토리 */}
      <div className="middle-mypage">
        <h2 className="mypage-title">좋아요 한 스토리</h2>
        <button className="id-add-friend" onClick={() => navigate('/add-friend')}>
          ID로 팔로우
        </button>
      </div>
      {likedStories.length > 0 ? (
        <>
          <ul className="memory-list">
            {likedStories.map((story) => (
              <li
                key={story.storyId}
                className="memory-item"
                onClick={() => navigate(`/story/detail/${story.storyId}`)}
              >
                <span className="memory-title">{story.title}</span>
                <span className="likes">좋아요 {story.likeCount}개</span>
                <button
                  className="add-friend-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/add-friend');
                  }}
                >
                  팔로우
                </button>
              </li>
            ))}
          </ul>
          {/* 페이지 네비게이션 */}
          {likedStoriesTotalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setLikedStoriesPage((prev) => Math.max(prev - 1, 0))}
                disabled={likedStoriesPage === 0}
              >
                이전
              </button>
              <span>
                {likedStoriesPage + 1} / {likedStoriesTotalPages}
              </span>
              <button
                onClick={() =>
                  setLikedStoriesPage((prev) =>
                    prev + 1 < likedStoriesTotalPages ? prev + 1 : prev
                  )
                }
                disabled={likedStoriesPage + 1 >= likedStoriesTotalPages}
              >
                다음
              </button>
            </div>
          )}
        </>
      ) : (
        <p>좋아요 한 추억이 없습니다.</p>
      )}

      {/* 하단 네비게이션 */}
      <FooterNav />
    </div>
  );
};

export default MyPage;
