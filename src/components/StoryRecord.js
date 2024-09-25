import React, { useState } from 'react';
import KakaoMap from '../Kakao/KakaoMap'; // KakaoMap 컴포넌트 불러오기
import { extractExifData } from '../function/exif'; // EXIF 데이터 추출 함수 불러오기

const StoryRecord = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [markers, setMarkers] = useState([]); // 지도에 추가된 마커 저장

  // 파일 선택 처리 (JPEG 파일만 허용)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => file.type === 'image/jpeg');

    if (validFiles.length > 0) {
      setSelectedFiles([...selectedFiles, ...validFiles]);
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);

      validFiles.forEach((file) => {
        // EXIF 데이터 추출
        extractExifData(file, (data) => {
          if (data) {
            const { latitude, longitude, dateTime } = data;

            // 추출된 데이터 콘솔 확인
            console.log('추출된 EXIF 데이터:', { latitude, longitude, dateTime });

            // 새로운 마커 추가
            const newMarker = { lat: latitude, lng: longitude, date: dateTime };
            setMarkers((prevMarkers) => [...prevMarkers, newMarker]);

            console.log('추가된 마커:', newMarker);
          } else {
            console.log('GPS 정보가 없습니다.');
          }
        });
      });
    }
  };

  return (
    <div>
      <h1>스토리 기록하기</h1>

      {/* 사진 등록 */}
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

      {/* Kakao 지도 추가 (추출된 마커 정보를 전달) */}
      <KakaoMap markers={markers} />
    </div>
  );
};

export default StoryRecord;
