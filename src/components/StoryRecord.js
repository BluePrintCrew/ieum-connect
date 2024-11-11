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
  const navigate = useNavigate();
  const isUpdatingKeywords = useRef(false);
  const detectedLabelsSet = useRef(new Set());

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
    };
    loadModel();
  }, []);

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
      files.forEach((file) => detectObjectsInImage(file));
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

  // 이미지에서 객체를 감지하는 함수
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
        if (predictions.length === 0) {
          // 객체가 없는 경우 ChatGPT API를 사용하여 키워드 추천
          console.log('객체가 없음: 배경 이미지로 간주하여 ChatGPT에 요청합니다.');
          await recommendKeywordsFromChatGPT(file);
        } else {
          predictions = predictions.slice(0, 2); // 최대 2개의 객체만 탐지
          const newLabels = predictions
            .map((prediction) => prediction.class)
            .filter((label) => !detectedLabelsSet.current.has(label));

          newLabels.forEach((label) => detectedLabelsSet.current.add(label));

          console.log("감지된 객체:", newLabels);

          // ChatGPT API를 이용해 추가적인 키워드 추천
          for (const label of newLabels) {
            await recommendKeywordsFromLabel(label);
          }
        }
      } catch (error) {
        console.error('객체 감지 중 오류 발생:', error);
      }
    };
  };

  // ChatGPT API를 사용하여 객체 라벨 기반 키워드 추천
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
              "당신은 재미있고 유행하는 키워드를 추천하는 어시스턴트입니다. 사용자가 이미지에서 특정 객체를 감지하면, 해당 객체 '${label}'와 관련된 한국어 해시태그 키워드 3개를 추천합니다. 예를 들어, '케이크'를 감지하면 '카페', '케이크맛집', '데이트장소'와 같은 사람들이 자주 사용하는 재미있고 유용한 단어를 제공합니다. 각 단어는 쉼표로 구분하여 한 줄로 작성하세요."
              `
            }
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
        .map((kw) => kw.trim().replace(/^#+/, '')) // 모든 기존 해시태그 제거
        .filter((kw) => kw !== '' && kw !== '"'); // 빈 문자열 및 따옴표 제거
      
      setRecommendedKeywords((prevKeywords) => [...prevKeywords, ...chatGPTKeywords]);
    } catch (error) {
      console.error('키워드 추천 중 오류 발생:', error);
    } finally {
      isUpdatingKeywords.current = false;
    }
  };

  // ChatGPT API를 사용하여 배경 이미지 기반 키워드 추천
  const recommendKeywordsFromChatGPT = async (file) => {
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
              "이미지에서 감지된 객체가 없는 경우, 사용자가 제공한 배경 이미지에 대해 한국어로 적절한 해시태그 키워드 3개를 추천합니다. 예를 들어, 자연 풍경 이미지를 보면 '힐링', '자연여행', '풍경사진'과 같은 사람들이 자주 사용하는 단어를 제공합니다. 각 단어는 쉼표로 구분하여 한 줄로 작성하세요."
              `
            }
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
        .map((kw) => kw.trim().replace(/^#+/, '')) // 모든 기존 해시태그 제거
        .filter((kw) => kw !== '' && kw !== '"' && kw !== '\''); // 빈 문자열 및 따옴표 제거
      
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
      {isSpotAdding && (
        <div className="spot-adding-notice">Spot 추가 모드가 활성화되었습니다. 지도를 클릭하여 Spot을 추가하세요.</div>
      )}
      <button onClick={toggleSpotAdding} className={`toggle-spot-button ${isSpotAdding ? 'active' : ''}`}>
        {isSpotAdding ? 'Spot 추가 모드 끄기' : 'Spot 추가 모드 켜기'}
      </button>
      <div className="image-preview-container">
        {imagePreviews.map((preview, index) => (
          <img key={index} src={preview} alt={`썸네일 ${index + 1}`} className="image-preview" />
        ))}
        <input
          type="file"
          accept="image/jpeg"
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
