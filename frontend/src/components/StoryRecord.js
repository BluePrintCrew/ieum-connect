import React, { useState, useEffect, useRef } from 'react';
import KakaoMap from '../Kakao/KakaoMap';
import { extractExifData } from '../function/exif';
import { getAddressFromCoords } from '../function/kakaoGeocoder';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../storyrecord.css';
import { useNavigate } from 'react-router-dom';
import FooterNav from './Footernav';
import axios from 'axios';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import imageCompression from 'browser-image-compression';

const StoryRecord = () => {
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [preference, setPreference] = useState(0);
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [recommendedKeywords, setRecommendedKeywords] = useState([]);
  const [isSpotAdding, setIsSpotAdding] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [isDroppableLoaded, setIsDroppableLoaded] = useState(false);
  const [model, setModel] = useState(null);
  const [visibility, setVisibility] = useState('PUBLIC');
  const navigate = useNavigate();
  const isUpdatingKeywords = useRef(false);
  const detectedLabelsSet = useRef(new Set());

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        console.log('COCO-SSD 모델이 성공적으로 로드되었습니다.');
      } catch (error) {
        console.error('모델 로드 중 오류 발생:', error);
      }
    };
    loadModel();
  }, []);

  useEffect(() => {
    if (markers.length > 0) {
      setIsDroppableLoaded(true);
    }
  }, [markers]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files).filter(
      (file) => file.type === 'image/jpeg' || file.type === 'image/png'
    );
    if (files.length > 0) {
      const compressedFiles = [];
      for (let file of files) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        try {
          const compressedFile = await imageCompression(file, options);
          compressedFiles.push(compressedFile);
        } catch (error) {
          console.error('이미지 압축 중 오류 발생:', error);
        }
      }
      setSelectedFiles([...selectedFiles, ...compressedFiles]);
      setImagePreviews([
        ...imagePreviews,
        ...compressedFiles.map((file) => URL.createObjectURL(file)),
      ]);
      compressedFiles.forEach((file) => extractExifData(file, addMarkerFromExif));
      compressedFiles.forEach((file) => detectObjectsInImage(file));
    }
  };

  const addMarkerFromExif = (data) => {
    if (data && data.latitude && data.longitude) {
      getAddressFromCoords(data.latitude, data.longitude, (address) => {
        const newMarker = {
          lat: data.latitude,
          lng: data.longitude,
          date: data.dateTime,
          address,
        };
        setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
        setAddresses((prevAddresses) => [...prevAddresses, address]);
      });
    }
  };

  const detectObjectsInImage = async (file) => {
    if (!model) {
      console.error('모델이 아직 로드되지 않았습니다.');
      return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
      try {
        let predictions = await model.detect(img);
        console.log('객체 감지 결과:', predictions);
        if (predictions.length === 0) {
          console.log('객체가 없음: 배경 이미지로 간주하여 ChatGPT에 요청합니다.');
          await recommendKeywordsFromChatGPT(file);
        } else {
          predictions = predictions.slice(0, 2);
          const newLabels = predictions
            .map((prediction) => prediction.class)
            .filter((label) => !detectedLabelsSet.current.has(label));

          newLabels.forEach((label) => detectedLabelsSet.current.add(label));

          for (const label of newLabels) {
            await recommendKeywordsFromLabel(label);
          }
        }
      } catch (error) {
        console.error('객체 감지 중 오류 발생:', error);
      }
    };

    img.onerror = (error) => {
      console.error('이미지 로드 중 오류 발생:', error);
    };
  };

  const recommendKeywordsFromLabel = async (label) => {
    if (isUpdatingKeywords.current) return;
    isUpdatingKeywords.current = true;

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: `
              당신은 재미있고 유행하는 키워드를 추천하는 어시스턴트입니다. 사용자가 이미지에서 특정 객체를 감지하면, 해당 객체 '${label}'와 관련된 한국어 해시태그 키워드 3개를 추천합니다. 예를 들어, '케이크'를 감지하면 '카페', '케이크맛집', '데이트장소'와 같은 사람들이 자주 사용하는 재미있고 유용한 단어를 제공합니다. 각 단어는 쉼표로 구분하여 한 줄로 작성하세요.
              `,
            },
          ],
          max_tokens: 50,
          n: 1,
          stop: null,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_CHATGPT_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const chatGPTKeywords = response.data.choices[0].message.content
        .split(',')
        .map((kw) => kw.trim().replace(/^#+/, ''))
        .filter((kw) => kw !== '' && kw !== '"');

      console.log(`추천된 키워드 (${label}):`, chatGPTKeywords);

      setRecommendedKeywords((prevKeywords) => [...prevKeywords, ...chatGPTKeywords]);
    } catch (error) {
      console.error('키워드 추천 중 오류 발생:', error);
    } finally {
      isUpdatingKeywords.current = false;
    }
  };

  const recommendKeywordsFromChatGPT = async () => {
    if (isUpdatingKeywords.current) return;
    isUpdatingKeywords.current = true;

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: `
              이미지에서 감지된 객체가 없는 경우, 사용자가 제공한 배경 이미지에 대해 한국어로 적절한 해시태그 키워드 3개를 추천합니다. 예를 들어, 자연 풍경 이미지를 보면 '힐링', '자연여행', '풍경사진'과 같은 사람들이 자주 사용하는 단어를 제공합니다. 각 단어는 쉼표로 구분하여 한 줄로 작성하세요.
              `,
            },
          ],
          max_tokens: 50,
          n: 1,
          stop: null,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_CHATGPT_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const chatGPTKeywords = response.data.choices[0].message.content
        .split(',')
        .map((kw) => kw.trim().replace(/^#+/, ''))
        .filter((kw) => kw !== '' && kw !== '"' && kw !== "'");

      console.log('추천된 배경 이미지 키워드:', chatGPTKeywords);

      setRecommendedKeywords((prevKeywords) => [...prevKeywords, ...chatGPTKeywords]);
    } catch (error) {
      console.error('배경 이미지 키워드 추천 중 오류 발생:', error);
    } finally {
      isUpdatingKeywords.current = false;
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

  const addRecommendedKeyword = (keyword) => {
    const cleanedKeyword = keyword.replace(/^#+/, '').trim();
    const formattedKeyword = `${cleanedKeyword}`;

    if (!hashtags.includes(formattedKeyword)) {
      setHashtags([...hashtags, formattedKeyword]);
    }
  };

  const removeHashtag = (indexToRemove) =>
    setHashtags(hashtags.filter((_, index) => index !== indexToRemove));
  const toggleSpotAdding = () => setIsSpotAdding(!isSpotAdding);

  const convertMarkersToRoutePoints = () => {
    return markers.map((marker, index) => ({
      latitude: marker.lat,
      longitude: marker.lng,
      orderNum: index + 1,
    }));
  };

  const handleSubmit = async () => {
    // 필수 입력 사항 확인
    if (!title.trim() || !memo.trim()) {
      alert('제목과 메모는 필수 입력 사항입니다.');
      return;
    }

    if (selectedFiles.length === 0) {
      alert('이미지를 하나 이상 업로드해야 합니다.');
      return;
    }

    if (markers.length === 0) {
      alert('경로에 최소 하나 이상의 스팟이 필요합니다.');
      return;
    }

    // routePoints 준비
    const routePoints = convertMarkersToRoutePoints();

    // storyInfo 객체 생성
    const storyInfo = {
      title: title.trim(),
      memo: memo.trim(),
      preference,
      visibility,
      hashtags: hashtags.filter(Boolean),
      routePoints,
    };

    // FormData 객체 생성
    const formData = new FormData();

    // storyInfo를 JSON 문자열로 추가
    formData.append('storyInfo', JSON.stringify(storyInfo));

    // 이미지 추가
    selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    // FormData 내용 확인 (디버깅용)
    for (let [key, value] of formData.entries()) {
      if (key === 'storyInfo') {
        try {
          const parsed = JSON.parse(value);
          console.log(key, parsed);
        } catch (error) {
          console.error('storyInfo JSON 파싱 오류:', error);
        }
      } else {
        console.log(key, value);
      }
    }

    try {
      // 'Content-Type' 헤더를 설정하지 않습니다. axios가 자동으로 설정합니다.
      const response = await axios.post('http://localhost:8080/api/stories', formData);

      if (response.status === 200) {
        console.log('스토리 생성 성공:', response.data);
        navigate('/stories');
      } else {
        console.error('예상치 못한 응답:', response);
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
    <div className="storyrecord-container">
      <h1 className="storyrecord-title">스토리 기록하기</h1>
      <input
        type="text"
        placeholder="제목을 입력하세요"
        value={title}
        onChange={handleTitleChange}
        className="title-input"
      />
      {/* visibility 선택 요소 추가 */}
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
      <button
        onClick={toggleSpotAdding}
        className={`toggle-spot-button ${isSpotAdding ? 'active' : ''}`}
      >
        {isSpotAdding ? 'Spot 추가 모드 끄기' : 'Spot 추가 모드 켜기'}
      </button>
      <div className="image-preview-container">
        {imagePreviews.map((preview, index) => (
          <img key={index} src={preview} alt={`썸네일 ${index + 1}`} className="image-preview" />
        ))}
        <input
          type="file"
          accept="image/jpeg,image/png"
          multiple
          onChange={handleFileChange}
          id="fileUpload"
          className="file-upload"
        />
        <label htmlFor="fileUpload" className="upload-label">
          +
        </label>
      </div>
      <textarea
        placeholder="메모를 입력하세요... "
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

      {/* 추천 키워드 섹션 */}
      <h3 className="recommended-keywords-title">추천 키워드</h3>
      <div className="recommended-keywords-container">
        {recommendedKeywords.map((keyword, index) => (
          <div key={index} className="recommended-keyword" onClick={() => addRecommendedKeyword(keyword)}>
            {keyword}
          </div>
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
      <button onClick={handleSubmit} className="submit-button">
        완료
      </button>
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
      <FooterNav />
    </div>
  );
};

export default StoryRecord;
