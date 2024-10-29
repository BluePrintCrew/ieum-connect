// StoryRecord Component
import React, { useState } from 'react';
import KakaoMap from '../Kakao/KakaoMap';
import { extractExifData } from '../function/exif';
import { getAddressFromCoords } from '../function/kakaoGeocoder';

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
    // Additional submit logic here
  };

  return (
    <div>
      <h1>스토리 기록하기</h1>
      <input type="text" placeholder="제목을 입력하세요" value={title} onChange={handleTitleChange} style={{ width: '100%', padding: '10px', marginBottom: '20px' }} />
      <div style={{ border: isSpotAdding ? '3px solid blue' : '1px solid gray', opacity: isSpotAdding ? 0.8 : 1 }}>
        <KakaoMap isSpotAdding={isSpotAdding} markers={markers} setMarkers={setMarkers} />
      </div>
      {isSpotAdding && <div style={{ color: 'pink', marginTop: '10px' }}>Spot 추가 모드가 활성화되었습니다. 지도를 클릭하여 Spot을 추가하세요.</div>}
      <button onClick={toggleSpotAdding} style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: isSpotAdding ? 'red' : 'blue', color: 'white' }}>
        {isSpotAdding ? 'Spot 추가 모드 끄기' : 'Spot 추가 모드 켜기'}
      </button>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          {imagePreviews.map((preview, index) => (
            <img key={index} src={preview} alt={`썸네일 ${index + 1}`} style={{ width: '50px', height: '50px', marginRight: '10px' }} />
          ))}
          <input type="file" accept="image/jpeg" multiple onChange={handleFileChange} style={{ display: 'none' }} id="fileUpload" />
          <label htmlFor="fileUpload" style={{ cursor: 'pointer', padding: '10px', border: '1px solid gray' }}>+</label>
        </div>
      </div>
      <textarea placeholder="메모를 입력하세요... #해시태그" value={memo} onChange={handleMemoChange} style={{ width: '100%', height: '100px', marginBottom: '20px' }} />
      <div>
        <h3>코스 만족도 설정</h3>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {[1, 2, 3].map((level) => (
            <span key={level} onClick={() => handlePreferenceChange(level)} style={{ cursor: 'pointer', fontSize: '30px', color: preference >= level ? 'red' : 'gray', marginLeft: level > 1 ? '10px' : '0' }}>
              {preference >= level ? '❤️' : '♡'}
            </span>
          ))}
        
        </div>
        <p>선택된 만족도: {preference}단계</p>
      </div>
      <div>
        <h3>해시태그 추가</h3>
        <input type="text" placeholder="해시태그를 입력하세요" value={hashtagInput} onChange={handleHashtagChange} onKeyPress={handleHashtagKeyPress} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {hashtags.map((hashtag, index) => (
            <div key={index} style={{ backgroundColor: '#e0e0e0', borderRadius: '20px', padding: '5px 10px', display: 'flex', alignItems: 'center' }}>
              <span>{`#${hashtag}`}</span>
              <button onClick={() => removeHashtag(index)} style={{ marginLeft: '10px', cursor: 'pointer', background: 'none', border: 'none', color: 'red' }}>X</button>
            </div>
          ))}
        </div>
      </div>
     {/*</div> <button onClick={console.log('API Key:', process.env.REACT_APP_KAKAO_REST_API_KEY);}테스트</button>*/}
     <button onClick={() => console.log('API Key:', process.env.REACT_APP_KAKAO_REST_API_KEY)}>테스트</button>

      <button onClick={handleSubmit} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: 'green', color: 'white' }}>완료</button>
      <h3>저장된 Spot 정보:</h3>
      <ul>
        {markers.map((marker, index) => (
          <li key={index}><strong>위도:</strong> {marker.lat}, <strong>경도:</strong> {marker.lng}, <strong>주소:</strong> {marker.address}, <strong>시간:</strong> {marker.date}</li>
        ))}
      </ul>
    </div>
  );
};

export default StoryRecord;