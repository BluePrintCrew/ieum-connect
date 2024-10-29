import React, { useState, useEffect } from 'react';
import KakaoMap from '../Kakao/KakaoMap';
import { extractExifData } from '../function/exif';
import { getAddressFromCoords } from '../function/kakaoGeocoder';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './storyrecord.css'; // 분리된 CSS 파일 임포트
import { useNavigate } from 'react-router-dom';

const StoryRecord = () => {
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [preference, setPreference] = useState(0);
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [isSpotAdding, setIsSpotAdding] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [isDroppableLoaded, setIsDroppableLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (markers.length > 0) {
      setIsDroppableLoaded(true);
    }
  }, [markers]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).filter((file) => file.type === 'image/jpeg');
    if (files.length > 0) {
      setSelectedFiles([...selectedFiles, ...files]);
      setImagePreviews([...imagePreviews, ...files.map((file) => URL.createObjectURL(file))]);
      files.forEach((file) => extractExifData(file, addMarkerFromExif));
    }
  };

  const addMarkerFromExif = (data) => {
    if (data && data.latitude && data.longitude) {
      getAddressFromCoords(data.latitude, data.longitude, (address) => {
        const newMarker = { lat: data.latitude, lng: data.longitude, date: data.dateTime, address };
        setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
        setAddresses((prevAddresses) => [...prevAddresses, address]);
      });
    }
  };

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleMemoChange = (e) => setMemo(e.target.value);
  const handlePreferenceChange = (newPreference) => setPreference(newPreference);
  const handleHashtagChange = (e) => setHashtagInput(e.target.value);

  const handleHashtagKeyPress = (e) => {
    if (e.key === 'Enter' && hashtagInput.trim() !== '') {
      setHashtags([...hashtags, hashtagInput.trim()]);
      setHashtagInput('');
    }
  };

  const removeHashtag = (indexToRemove) => setHashtags(hashtags.filter((_, index) => index !== indexToRemove));
  const toggleSpotAdding = () => setIsSpotAdding(!isSpotAdding);

  const handleSubmit = () => {
    console.log({ title, selectedFiles, memo, preference, hashtags, markers, addresses });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const updatedMarkers = Array.from(markers);
    const [reorderedMarker] = updatedMarkers.splice(result.source.index, 1);
    updatedMarkers.splice(result.destination.index, 0, reorderedMarker);
    setMarkers(updatedMarkers);
  };

  return (
    <div className="storyrecord-container">
      <h1 className="storyrecord-title">스토리 기록하기</h1>
      <input 
        type="text" 
        placeholder="제목을 입력하세요" 
        value={title} 
        onChange={handleTitleChange} 
        className="title-input" 
      />
      <div className={`map-container ${isSpotAdding ? 'spot-adding' : ''}`}>
        <KakaoMap isSpotAdding={isSpotAdding} markers={markers} setMarkers={setMarkers} />
      </div>
      {isSpotAdding && <div className="spot-adding-notice">Spot 추가 모드가 활성화되었습니다. 지도를 클릭하여 Spot을 추가하세요.</div>}
      <button onClick={toggleSpotAdding} className={`toggle-spot-button ${isSpotAdding ? 'active' : ''}`}>
        {isSpotAdding ? 'Spot 추가 모드 끄기' : 'Spot 추가 모드 켜기'}
      </button>
      <div className="image-preview-container">
        {imagePreviews.map((preview, index) => (
          <img key={index} src={preview} alt={`썸네일 ${index + 1}`} className="image-preview" />
        ))}
        <input type="file" accept="image/jpeg" multiple onChange={handleFileChange} id="fileUpload" className="file-upload" />
        <label htmlFor="fileUpload" className="upload-label">+</label>
      </div>
      <textarea 
        placeholder="메모를 입력하세요... " 
        value={memo} 
        onChange={handleMemoChange} 
        className="memo-textarea" 
      />
      <div className="preference-container">
        {[1, 2, 3].map((level) => (
          <span key={level} onClick={() => handlePreferenceChange(level)} className={`preference-icon ${preference >= level ? 'active' : ''}`}>
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
            <button onClick={() => removeHashtag(index)} className="hashtag-remove">X</button>
          </div>
        ))}
      </div>
      <button onClick={handleSubmit} className="submit-button">완료</button>
      <h3 className="saved-spot-title">저장된 Spot 정보:</h3>
      <DragDropContext onDragEnd={onDragEnd}>
        {isDroppableLoaded && (
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
        )}
      </DragDropContext>
      <div className="footer-nav">
        <button onClick={() => navigate('/home')}>홈 화면</button>
        <button onClick={() => navigate('/record')}>스토리 기록하기</button>
        <button onClick={() => navigate('/memory-plan')}>추억 계획하기</button>
        <button onClick={() => navigate('/mypage')}>마이페이지</button>
      </div>
    </div>
    
  );
};

export default StoryRecord;
