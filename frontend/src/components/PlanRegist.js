import React, { useState, useEffect, useRef } from 'react';
import KakaoMap from '../Kakao/KakaoMap';
import { extractExifData } from '../function/exif';
import { getAddressFromCoords } from '../function/kakaoGeocoder';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../storyrecord.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

// axiosInstance 중복 제거
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

const PlanRegist = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  // Query Parameters에서 mod와 storyId 추출
  const queryParams = new URLSearchParams(location.search);
  const mod = queryParams.get('mod'); // 'regist' 또는 'edit'
  const storyId = queryParams.get('storyId');

  // 상태 변수 정의
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [preference, setPreference] = useState(0);
  const [hashtags, setHashtags] = useState([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [markers, setMarkers] = useState([]);
  const [visibility, setVisibility] = useState('PUBLIC');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [model, setModel] = useState(null);
  const [recommendedKeywords, setRecommendedKeywords] = useState([]);
  const [isSpotAdding, setIsSpotAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const detectedLabelsSet = useRef(new Set());
  const isUpdatingKeywords = useRef(false);
  const [addressesUpdated, setAddressesUpdated] = useState(false);
  const [center, setCenter] = useState({ lat: 37.5665, lng: 126.978 });

  // 모델 로드
  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        console.log('모델이 로드되었습니다.');
      } catch (error) {
        console.error('모델 로드 중 오류 발생:', error);
      }
    };
    loadModel();
  }, []);

  // 스토리 데이터 가져오기 (등록/수정 모드 공통)
  useEffect(() => {
    if (storyId) {
      const fetchStoryData = async () => {
        try {
          const response = await axiosInstance.get(`/api/stories/${storyId}`);
          const storyData = response.data;

          setTitle(storyData.title);
          setMemo(storyData.description);
          setPreference(storyData.preference);
          setHashtags(storyData.hashtags);
          setVisibility(storyData.visibility);
          setMarkers(
            storyData.route?.routePoints.map((point) => ({
              lat: point.latitude,
              lng: point.longitude,
              orderNum: point.orderNum,
            })) || []
          );

          // 스토리의 사진 데이터를 개별적으로 가져오기
          const photoPromises = storyData.photos.map((photo) =>
            axiosInstance.get(`/api/photos/${photo.photoId}`, {
              responseType: 'blob',
            })
          );
          const photoResponses = await Promise.all(photoPromises);
          const photoData = photoResponses.map((res, index) => ({
            photoUrl: URL.createObjectURL(res.data),
            photoId: storyData.photos[index].photoId,
          }));
          setExistingImages(photoData);

          // 지도 중심 설정
          if (storyData.route?.routePoints.length > 0) {
            setCenter({
              lat: storyData.route.routePoints[0].latitude,
              lng: storyData.route.routePoints[0].longitude,
            });
          }
        } catch (error) {
          console.error('스토리 데이터를 가져오는 중 오류 발생:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchStoryData();
    } else {
      setLoading(false);
    }
  }, [storyId]);

  // 주소 업데이트
  useEffect(() => {
    const updateMarkersWithAddresses = async () => {
      if (markers.length > 0 && !addressesUpdated) {
        const updatedMarkers = await Promise.all(
          markers.map(async (marker) => {
            const address = await new Promise((resolve) => {
              getAddressFromCoords(marker.lat, marker.lng, (addr) => {
                resolve(addr);
              });
            });
            return { ...marker, address };
          })
        );

        setMarkers(updatedMarkers);
        setAddressesUpdated(true);
      }
    };

    updateMarkersWithAddresses();
  }, [markers, addressesUpdated]);  // 이미지 처리 함수들
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files).filter(
      (file) => file.type === 'image/jpeg' || file.type === 'image/png'
    );
    if (files.length > 0) {
      setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
      setImagePreviews((prevPreviews) => [
        ...prevPreviews,
        ...files.map((file) => URL.createObjectURL(file)),
      ]);
      for (const file of files) {
        await processImage(file);
      }
    }
  };

  const removeNewImage = (indexToRemove) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
    setImagePreviews((prevPreviews) =>
      prevPreviews.filter((_, index) => index !== indexToRemove)
    );
  };

  const removeExistingImage = (imageId) => {
    setExistingImages((prevImages) => prevImages.filter((img) => img.imageId !== imageId));
    setImagesToDelete((prev) => [...prev, imageId]);
  };

  const processImage = async (file) => {
    try {
      await extractExifData(file, addMarkerFromExif);
    } catch (error) {
      console.error('EXIF 데이터 추출 중 오류 발생:', error);
    }
    await detectObjectsInImage(file);
  };

  const addMarkerFromExif = (data) => {
    console.log('EXIF 데이터:', data);
    if (data && data.latitude && data.longitude) {
      getAddressFromCoords(data.latitude, data.longitude, (address) => {
        const newMarker = {
          lat: data.latitude,
          lng: data.longitude,
          date: data.dateTime,
          address,
        };
        setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
        setAddressesUpdated(false); // 새로운 마커가 추가되었으므로 주소 업데이트 플래그 초기화
      });
    } else {
      console.warn('위도 및 경도 정보가 없습니다. EXIF 데이터:', data);
    }
  };

  // 객체 감지 및 키워드 추천 함수들
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
        console.log('탐지된 객체:', predictions);
        if (predictions.length === 0) {
          await recommendKeywordsFromChatGPT();
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
    await recommendKeywords(
      `사용자가 이미지에서 '${label}' 객체를 감지하였습니다. 해당 객체와 관련된 한국어 해시태그 키워드 3개를 추천해 주세요. 예를 들어 ${label}, ${label}사진, ${label}스타그램 그리고 숫자나 기호는 답으로 주지말고 단어로만 답변해주세요.`
    );
    isUpdatingKeywords.current = false;
  };

  const recommendKeywordsFromChatGPT = async () => {
    if (isUpdatingKeywords.current) return;
    isUpdatingKeywords.current = true;
    await recommendKeywords(
      "이미지에서 탐지된 객체가 없으므로, 이 이미지는 풍경 사진일 가능성이 높습니다. 풍경 사진과 관련된 한국어 해시태그 키워드 3개를 추천해 주세요. 예를 들어 산, 바다, 하늘, 풍경스타그램, 여행 그리고 숫자나 기호는 답으로 주지말고 단어로만 답변해주세요."
    );
    isUpdatingKeywords.current = false;
  };

  const recommendKeywords = async (prompt) => {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt,
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

      setRecommendedKeywords((prevKeywords) => [...prevKeywords, ...chatGPTKeywords]);
    } catch (error) {
      console.error('키워드 추천 중 오류 발생:', error);
    }
  };

  // 입력 필드 및 이벤트 핸들러들
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

  const addRecommendedKeyword = (keyword) => {
    const cleanedKeyword = keyword.replace(/^#+/, '').trim();
    if (!hashtags.includes(cleanedKeyword)) {
      setHashtags((prevHashtags) => [...prevHashtags, cleanedKeyword]);
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
      address: marker.address || '',
    }));
  };

  // 제출 핸들러
  const handleSubmit = async () => {
    if (!title.trim() || !memo.trim()) {
      alert('제목과 메모는 필수 입력 사항입니다.');
      return;
    }
    if (selectedFiles.length === 0 && existingImages.length === 0) {
      alert('이미지를 하나 이상 업로드해야 합니다.');
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
      planState: 'PUBLISH',
      hashtags: hashtags.filter(Boolean),
      routePoints,
    };

    try {
      let storyInfoResponse;

      if (mod === 'edit' && storyId) {
        // 수정 모드의 경우 PUT 요청
        storyInfoResponse = await axios.put(
          `http://localhost:8080/api/stories/${storyId}/info`,
          storyInfo,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      } else {
        // 등록 모드의 경우 POST 요청
        storyInfoResponse = await axios.post(
          `http://localhost:8080/api/stories/info`,
          storyInfo,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (storyInfoResponse.status === 200) {
        console.log('스토리 정보 업데이트 성공:', storyInfoResponse.data);
        const savedStoryId = storyInfoResponse.data.savedStoryId;

        // 삭제할 이미지 삭제
        for (const imageId of imagesToDelete) {
          await axios.delete(`http://localhost:8080/api/stories/${savedStoryId}/images/${imageId}`);
        }

        // 새로 추가된 이미지 업로드
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

        // 모든 처리가 성공적으로 완료된 후 홈으로 이동
        alert('스토리가 성공적으로 업데이트되었습니다!');
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

  // 마커 순서 변경
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const updatedMarkers = Array.from(markers);
    const [reorderedMarker] = updatedMarkers.splice(result.source.index, 1);
    updatedMarkers.splice(result.destination.index, 0, reorderedMarker);
    setMarkers(updatedMarkers);
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="storyrecord-container">
      <h1 className="storyrecord-title">{mod === 'regist' ? '스토리 기록하기' : '스토리 수정하기'}</h1>
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
        <KakaoMap
          isSpotAdding={isSpotAdding}
          markers={markers}
          setMarkers={setMarkers}
          center={center}
        />
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
      {/* 기존 이미지 표시 */}
      <div className="image-preview-container">
        {existingImages.length > 0 && (
          <>
       {/*     <h3>기존 이미지</h3>  */}
            <div className="existing-images">
              {existingImages.map((photo, index) => (
                <div key={photo.photoId} className="image-preview-item">
                  <img src={photo.photoUrl} alt={`기존 이미지 ${index + 1}`} className="image-preview" />
                  <button
                    className="remove-image-button"
                    onClick={() => removeExistingImage(photo.photoId)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
        {/* 새로 추가된 이미지 미리보기 */}
        {imagePreviews.length > 0 && (
          <>
            {/*<h3>새로 추가된 이미지</h3>a*/}
            <div className="new-images">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="image-preview-item">
                  <img src={preview} alt={`새 이미지 ${index + 1}`} className="image-preview" />
                  <button className="remove-image-button" onClick={() => removeNewImage(index)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
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
      <h3 className="recommended-keywords-title">추천 키워드</h3>
      <div className="recommended-keywords-container">
        {recommendedKeywords.map((keyword, index) => (
          <div
            key={index}
            className="recommended-keyword"
            onClick={() => addRecommendedKeyword(keyword)}
          >
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
    </div>
  );
};

export default PlanRegist;
