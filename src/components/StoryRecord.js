import React, { useState } from 'react';
import KakaoMap from '../Kakao/KakaoMap'; // KakaoMap 컴포넌트 불러오기
import { extractExifData } from '../function/exif'; // EXIF 데이터 추출 함수 불러오기
import { getAddressFromCoords } from '../function/kakaoGeocoder'; // 좌표로 주소를 변환하는 함수

const StoryRecord = () => {
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [preference, setPreference] = useState(0); // 기본 선호도 0단계
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [isSpotAdding, setIsSpotAdding] = useState(false); // 마커 추가 활성화 여부
  const [markers, setMarkers] = useState([]); // 지도에 추가된 마커 저장
  const [addresses, setAddresses] = useState([]); // 주소 정보 저장

  // 파일 선택 처리 (JPEG 파일만 허용)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => file.type === 'image/jpeg');

    if (validFiles.length > 0) {
      setSelectedFiles([...selectedFiles, ...validFiles]);
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);

      // EXIF 데이터에서 GPS 정보 추출 및 마커 추가
      validFiles.forEach((file) => {
        // EXIF 데이터 추출
        extractExifData(file, (data) => {
          if (data && data.latitude && data.longitude) {
            const { latitude, longitude, dateTime } = data;

            // 좌표로 주소 검색 후 마커 추가
            getAddressFromCoords(latitude, longitude, (address) => {
              const newMarker = { lat: latitude, lng: longitude, date: dateTime, address };
              setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
              setAddresses((prevAddresses) => [...prevAddresses, address]);

              console.log('추가된 마커:', newMarker);
            });
          } else {
            console.log('GPS 정보가 없는 사진입니다.');
          }
        });
      });
    }
  };

  // 제목 입력 핸들러
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  // 메모 입력 핸들러
  const handleMemoChange = (e) => {
    setMemo(e.target.value);
  };

  // 선호도 설정 (1단계, 2단계, 3단계 하트 선택)
  const handlePreferenceChange = (newPreference) => {
    setPreference(newPreference);
  };

  // 해시태그 추가 핸들러
  const handleHashtagChange = (e) => {
    setHashtagInput(e.target.value);
  };

  const handleHashtagKeyPress = (e) => {
    if (e.key === 'Enter' && hashtagInput.trim() !== '') {
      setHashtags([...hashtags, hashtagInput.trim()]);
      setHashtagInput(''); // 입력 필드 초기화
    }
  };

  const removeHashtag = (indexToRemove) => {
    setHashtags(hashtags.filter((_, index) => index !== indexToRemove));
  };

  // Spot 추가 핸들러
  const toggleSpotAdding = () => {
    setIsSpotAdding(!isSpotAdding); // Spot 추가 모드를 토글
  };

  const handleSubmit = () => {
    console.log('제목:', title);
    console.log('사진:', selectedFiles);
    console.log('메모:', memo);
    console.log('만족도:', preference);
    console.log('해시태그:', hashtags);
    console.log('저장된 마커들:', markers);
    console.log('추가된 주소들:', addresses);
    // 여기에 제출 로직 추가
  };

  return (
    <div>
      <h1>스토리 기록하기</h1>

      {/* 제목 입력 필드 */}
      <input
        type="text"
        placeholder="제목을 입력하세요"
        value={title}
        onChange={handleTitleChange}
        style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
      />

      {/* 카카오 지도 추가 (Spot 추가 여부 및 마커 전달) */}
      <div
        style={{
          border: isSpotAdding ? '3px solid blue' : '1px solid gray', // Spot 추가 모드에 따라 테두리 변경
          opacity: isSpotAdding ? 0.8 : 1, // Spot 추가 모드 시 지도 약간 투명하게
        }}
      >
        <KakaoMap isSpotAdding={isSpotAdding} markers={markers} />
      </div>

      {/* Spot 추가 모드 알림 */}
      {isSpotAdding && (
        <div style={{ color: 'pink', marginTop: '10px' }}>
          Spot 추가 모드가 활성화되었습니다. 지도를 클릭하여 Spot을 추가하세요.
        </div>
      )}

      {/* Spot 추가 버튼 */}
      <button
        onClick={toggleSpotAdding}
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          backgroundColor: isSpotAdding ? 'red' : 'blue',
          color: 'white',
        }}
      >
        {isSpotAdding ? 'Spot 추가 모드 끄기' : 'Spot 추가 모드 켜기'}
      </button>

      {/* 사진 미리보기 및 등록 */}
      <div>
        <h3>사진 등록</h3>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          {imagePreviews.map((preview, index) => (
            <img
              key={index}
              src={preview}
              alt={`썸네일 ${index + 1}`}
              style={{ width: '50px', height: '50px', marginRight: '10px' }}
            />
          ))}
          <input
            type="file"
            accept="image/jpeg"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="fileUpload"
          />
          <label htmlFor="fileUpload" style={{ cursor: 'pointer', padding: '10px', border: '1px solid gray' }}>
            +
          </label>
        </div>
      </div>

      {/* 메모 입력 필드 */}
      <textarea
        placeholder="메모를 입력하세요... #해시태그"
        value={memo}
        onChange={handleMemoChange}
        style={{ width: '100%', height: '100px', marginBottom: '20px' }}
      />

      {/* 선호도 설정 (하트 아이콘) */}
      <div>
        <h3>코스 만족도 설정</h3>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            onClick={() => handlePreferenceChange(1)}
            style={{ cursor: 'pointer', fontSize: '30px', color: preference >= 1 ? 'red' : 'gray' }}
          >
            {preference >= 1 ? '❤️' : '♡'}
          </span>
          <span
            onClick={() => handlePreferenceChange(2)}
            style={{ cursor: 'pointer', fontSize: '30px', color: preference >= 2 ? 'red' : 'gray', marginLeft: '10px' }}
          >
            {preference >= 2 ? '❤️' : '♡'}
          </span>
          <span
            onClick={() => handlePreferenceChange(3)}
            style={{ cursor: 'pointer', fontSize: '30px', color: preference >= 3 ? 'red' : 'gray', marginLeft: '10px' }}
          >
            {preference >= 3 ? '❤️' : '♡'}
          </span>
        </div>
        <p>선택된 만족도: {preference}단계</p>
      </div>

      {/* 해시태그 입력 필드 */}
      <div>
        <h3>해시태그 추가</h3>
        <input
          type="text"
          placeholder="해시태그를 입력하세요"
          value={hashtagInput}
          onChange={handleHashtagChange}
          onKeyPress={handleHashtagKeyPress}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {hashtags.map((hashtag, index) => (
            <div key={index} style={{ backgroundColor: '#e0e0e0', borderRadius: '20px', padding: '5px 10px', display: 'flex', alignItems: 'center' }}>
              <span>{`#${hashtag}`}</span>
              <button
                onClick={() => removeHashtag(index)}
                style={{ marginLeft: '10px', cursor: 'pointer', background: 'none', border: 'none', color: 'red' }}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
  
        {/* 완료 버튼 */}
        <button 
          onClick={handleSubmit} 
          style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: 'green', color: 'white' }}
        >
          완료
        </button>
  
        {/* 추가된 마커 정보 */}
        <h3>저장된 Spot 정보:</h3>
        <ul>
          {markers.map((marker, index) => (
            <li key={index}>
              <strong>위도:</strong> {marker.lat}, <strong>경도:</strong> {marker.lng}, <strong>주소:</strong> {marker.address}, <strong>시간:</strong> {marker.date}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default StoryRecord;
   
