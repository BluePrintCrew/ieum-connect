// StoryPlan.js
import React, { useState, useEffect } from 'react';
import KakaoMap from '../Kakao/KakaoMap';
import { getAddressFromCoords } from '../function/kakaoGeocoder';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../StoryPlan.css';
import { useNavigate, useParams } from 'react-router-dom';
import FooterNav from './Footernav';
import axios from 'axios';

const StoryPlan = () => {
  const navigate = useNavigate();
  const { storyId } = useParams(); // storyId를 URL에서 가져옵니다.
  // const location = useLocation(); // location은 더 이상 사용하지 않습니다.
  // const { markers: initialMarkers = [], hashtags: initialHashtags = [] } = location.state || {};

  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [preference, setPreference] = useState(0);
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState([]); // 초기값을 빈 배열로 설정합니다.
  const [isSpotAdding, setIsSpotAdding] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [visibility, setVisibility] = useState('PUBLIC');
  const user = JSON.parse(localStorage.getItem('user'));

  // 서버로부터 스토리 데이터를 가져옵니다.
  useEffect(() => {
    const fetchStoryData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/stories/${storyId}`, {
          params: {
            currentUserId: user.userId,
          },
        });

        const storyData = response.data;

        if (storyData) {
          setTitle(storyData.title || '');
          setMemo(storyData.description || '');
          setPreference(storyData.preference || 0);
          setVisibility(storyData.visibility || 'PUBLIC');
          setHashtags(storyData.hashtags || []);

          // routePoints로부터 마커 정보를 추출합니다.
          const initialMarkers =
            storyData.route?.routePoints.map((point) => ({
              lat: point.latitude,
              lng: point.longitude,
              orderNum: point.orderNum,
            })) || [];

          // 각 마커에 주소 정보를 추가합니다.
          const updatedMarkers = await Promise.all(
            initialMarkers.map(async (marker) => {
              const address = await new Promise((resolve) => {
                getAddressFromCoords(marker.lat, marker.lng, (addr) => {
                  resolve(addr);
                });
              });
              return { ...marker, address };
            })
          );

          // orderNum을 기준으로 마커를 정렬합니다.
          updatedMarkers.sort((a, b) => a.orderNum - b.orderNum);

          setMarkers(updatedMarkers);
        } else {
          console.error('스토리 데이터를 가져오는 데 실패했습니다.');
        }
      } catch (error) {
        console.error('스토리 데이터를 가져오는 중 오류 발생:', error);
      }
    };

    if (storyId) {
      fetchStoryData();
    }
  }, [storyId]);

  // 기존의 함수들과 로직은 그대로 유지됩니다.
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).filter(
      (file) => file.type === 'image/jpeg' || file.type === 'image/png'
    );
    if (files.length > 0) {
      setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
      setImagePreviews((prevPreviews) => [
        ...prevPreviews,
        ...files.map((file) => URL.createObjectURL(file)),
      ]);
    }
  };

  // 나머지 함수들과 이벤트 핸들러들도 동일하게 유지됩니다.
  const removeImage = (indexToRemove) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
    setImagePreviews((prevPreviews) => prevPreviews.filter((_, index) => index !== indexToRemove));
  };

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleMemoChange = (e) => setMemo(e.target.value);
  const handlePreferenceChange = (newPreference) => setPreference(newPreference);
  const handleHashtagChange = (e) => setHashtagInput(e.target.value);

  const handleHashtagKeyPress = (e) => {
    if (e.key === 'Enter' && hashtagInput.trim() !== '') {
      setHashtags((prevHashtags) => [...prevHashtags, hashtagInput.trim()]);
      setHashtagInput('');
    }
  };

  const removeHashtag = (indexToRemove) =>
    setHashtags((prevHashtags) => prevHashtags.filter((_, index) => index !== indexToRemove));

  const toggleSpotAdding = () => setIsSpotAdding((prev) => !prev);

  const convertMarkersToRoutePoints = () => {
    return markers.map((marker, index) => ({
      latitude: marker.lat,
      longitude: marker.lng,
      orderNum: index + 1,
    }));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !memo.trim()) {
      alert('제목과 메모는 필수 입력 사항입니다.');
      return;
    }
    if (markers.length === 0) {
      alert('경로에 최소 하나 이상의 스팟이 필요합니다.');
      return;
    }

    const routePoints = convertMarkersToRoutePoints();
    const storyInfo = {
      userId: parseInt(user.userId),
      title: title.trim(),
      memo: memo.trim(),
      preference,
      visibility,
      planState: 'PLANNED',
      hashtags: hashtags.filter(Boolean),
      routePoints,
    };

    try {
      const storyInfoResponse = await axios.post(
        'http://localhost:8080/api/stories/info',
        storyInfo,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (storyInfoResponse.status === 200) {
        console.log('스토리 정보 생성 성공:', storyInfoResponse.data);
        const savedStoryId = storyInfoResponse.data.savedStoryId;

        // 이미지를 저장된 스토리에 추가
        for (const file of selectedFiles) {
          const formData = new FormData();
          formData.append('image', file);

          const imageResponse = await axios.post(
            `http://localhost:8080/api/stories/${savedStoryId}/images`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          if (imageResponse.status === 200) {
            console.log('이미지 추가 성공:', imageResponse.data);
          } else {
            console.error('예상치 못한 응답:', imageResponse);
          }
        }

        alert('추억 계획이 저장되었습니다!');
        navigate('/home');
      } else {
        console.error('예상치 못한 응답:', storyInfoResponse);
      }
    } catch (error) {
      console.error('스토리 제출 중 오류 발생:', error);
      if (error.response && error.response.data) {
        console.error('서버 응답 메시지:', error.response.data);
      }
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const updatedMarkers = Array.from(markers);
    const [reorderedMarker] = updatedMarkers.splice(result.source.index, 1);
    updatedMarkers.splice(result.destination.index, 0, reorderedMarker);
    setMarkers(updatedMarkers);
  };

  return (
    <div className="storyplan-container">
      <h1 className="storyplan-title">추억 계획하기</h1>
      <input
        type="text"
        placeholder="제목을 입력하세요"
        value={title}
        onChange={handleTitleChange}
        className="title-input"
      />

      <div className="visibility-container">
        <label>
          공개 범위:
          <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
            <option value="PUBLIC">전체 공개</option>
            <option value="FRIENDS_ONLY">친구에게만 공개</option>
            <option value="PRIVATE">비공개</option>
          </select>
        </label>
      </div>
      <div className={`map-container ${isSpotAdding ? 'spot-adding' : ''}`}>
        <KakaoMap isSpotAdding={isSpotAdding} markers={markers} setMarkers={setMarkers} />
      </div>
      {isSpotAdding && (
        <div className="spot-adding-notice">
          Spot 추가 모드가 활성화되었습니다. 지도를 클릭하여 Spot을 추가하세요.
        </div>
      )}
      <div className="button-row-container">
        <button
          onClick={toggleSpotAdding}
          className={`toggle-spot-button ${isSpotAdding ? 'active' : ''}`}
        >
          {isSpotAdding ? '스팟추가모드 끄기' : '스팟추가모드'}
        </button>
        <button
          className="add-photo-button"
          onClick={() => document.getElementById('fileUpload').click()}
        >
          사진추가
        </button>
        <input
          type="file"
          accept="image/jpeg,image/png"
          multiple
          onChange={handleFileChange}
          id="fileUpload"
          style={{ display: 'none' }}
        />
      </div>
      <div className="image-preview-container">
        {imagePreviews.map((preview, index) => (
          <div key={index} className="image-preview-item">
            <img src={preview} alt={`썸네일 ${index + 1}`} className="image-preview" />
            <button className="remove-image-button" onClick={() => removeImage(index)}>
              ✕
            </button>
          </div>
        ))}
      </div>
      <textarea
        placeholder="메모를 입력하세요..."
        value={memo}
        onChange={handleMemoChange}
        className="memo-textarea"
      />
      <div className="preference-container">
        {[1, 2, 3].map((level) => (
          <span
            key={level}
            onClick={() => handlePreferenceChange(level)}
            className={`preference-icon ${preference >= level ? 'active' : ''}`}
          >
            {preference >= level ? '❤️' : '♡'}
          </span>
        ))}
      </div>
      <input
        type="text"
        placeholder="해시태그를 입력하세요"
        value={hashtagInput}
        onChange={handleHashtagChange}
        onKeyPress={handleHashtagKeyPress}
        className="hashtag-input"
      />
      <div className="hashtag-container">
        {hashtags.map((hashtag, index) => (
          <div key={index} className="hashtag">
            <span>{`#${hashtag}`}</span>
            <button onClick={() => removeHashtag(index)} className="hashtag-remove">
              X
            </button>
          </div>
        ))}
      </div>
      <h3 className="saved-spot-title">저장된 Spot 정보:</h3>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable-markers">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef} className="marker-list">
              {markers.map((marker, index) => (
                <Draggable key={`marker-${index}`} draggableId={`marker-${index}`} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="marker-item"
                    >
                      장소 {index + 1} - {marker.address}
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
      <button onClick={handleSubmit} className="submit-button">
        계획 저장하기
      </button>
      <FooterNav />
    </div>
  );
};

export default StoryPlan;
