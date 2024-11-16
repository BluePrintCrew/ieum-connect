import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './KakaoMap.css';

const KakaoMap = ({ center, isSpotAdding, markers, setMarkers }) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_APP_API_KEY}&autoload=false&libraries=services,clusterer,places`;
    script.async = true;

    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => setIsMapLoaded(true));
      } else {
        console.error('카카오 맵 스크립트 로딩 실패');
      }
    };
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

  useEffect(() => {
    if (isMapLoaded) {
      const mapContainer = document.getElementById('map');
      const mapOption = {
        center: new window.kakao.maps.LatLng(center?.lat || 37.2838, center?.lng || 127.0454),
        level: 5,
        draggable: true,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        keyboardShortcuts: false,
        minLevel: 3,
        maxLevel: 7,
      };
      const createdMap = new window.kakao.maps.Map(mapContainer, mapOption);
      setMap(createdMap);

      // Spot 추가 모드 설정
      if (isSpotAdding) {
        window.kakao.maps.event.addListener(createdMap, 'click', (mouseEvent) => {
          const latlng = mouseEvent.latLng;
          const newMarker = { lat: latlng.getLat(), lng: latlng.getLng() };
          setMarkers((prevMarkers) => [...prevMarkers, newMarker]);

          const marker = new window.kakao.maps.Marker({ position: latlng, map: createdMap });
          window.kakao.maps.event.addListener(marker, 'click', () => {
            marker.setMap(null);
            setMarkers((prevMarkers) =>
              prevMarkers.filter((m) => m.lat !== newMarker.lat || m.lng !== newMarker.lng)
            );
          });
        });
      }

      // 기존 마커 추가
      markers.forEach((marker) => {
        const markerPosition = new window.kakao.maps.LatLng(marker.lat, marker.lng);
        new window.kakao.maps.Marker({
          map: createdMap,
          position: markerPosition,
        });
      });

      // 경로 표시
      if (markers.length > 1) {
        for (let i = 0; i < markers.length - 1; i++) {
          const start = markers[i];
          const end = markers[i + 1];
          getWalkingRouteFromTmap(start, end, createdMap);
        }
      }
    }
  }, [isMapLoaded, markers, isSpotAdding, center]);

  const getWalkingRouteFromTmap = (start, end, map) => {
    const url = `https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json`;

    axios
      .post(
        url,
        {
          startX: start.lng,
          startY: start.lat,
          endX: end.lng,
          endY: end.lat,
          reqCoordType: 'WGS84GEO',
          resCoordType: 'WGS84GEO',
          startName: '출발지',
          endName: '도착지',
        },
        {
          headers: {
            appKey: process.env.REACT_APP_TMAP_API_KEY,
          },
        }
      )
      .then((response) => {
        const resultData = response.data.features;
        const points = [];

        resultData.forEach((feature) => {
          if (feature.geometry.type === 'LineString') {
            feature.geometry.coordinates.forEach((coordinate) => {
              points.push(new window.kakao.maps.LatLng(coordinate[1], coordinate[0]));
            });
          }
        });

        if (points.length > 0) {
          const polyline = new window.kakao.maps.Polyline({
            path: points,
            strokeWeight: 5,
            strokeColor: '#FF0000',
            strokeOpacity: 0.7,
            strokeStyle: 'solid',
          });
          polyline.setMap(map);
        } else {
          console.warn('Tmap에서 경로 데이터를 가져오지 못했습니다.');
        }
      })
      .catch((error) => {
        console.error('Tmap 도보 경로 요청에 실패했습니다:', error);
      });
  };

  // 검색 기능 구현
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      searchPlaces(searchQuery);
    }
  };

  const searchPlaces = (keyword) => {
    const ps = new window.kakao.maps.services.Places();

    ps.keywordSearch(keyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setSearchResults(data); // 검색 결과 저장
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 없습니다.');
        setSearchResults([]);
      } else {
        alert('검색 중 오류가 발생했습니다.');
        setSearchResults([]);
      }
    });
  };

  const handleResultClick = (place) => {
    const newCenter = new window.kakao.maps.LatLng(place.y, place.x);
    map.setCenter(newCenter);

    // 검색 결과 목록 숨기기
    setSearchResults([]);
    setIsSearchBarVisible(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px' }}>
      {/* 돋보기 아이콘 */}
      <button
        className="map-search-button"
        onClick={() => setIsSearchBarVisible(!isSearchBarVisible)}
      >
        🔍
      </button>

      {/* 검색바 */}
      {isSearchBarVisible && (
        <form onSubmit={handleSearchSubmit} className="map-search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="장소를 검색하세요"
          />
          <button type="submit">검색</button>
        </form>
      )}

      {/* 검색 결과 목록 */}
      {isSearchBarVisible && searchResults.length > 0 && (
        <ul className="map-search-results">
          {searchResults.map((place, index) => (
            <li
              key={index}
              className="map-search-result-item"
              onClick={() => handleResultClick(place)}
            >
              {place.place_name}
            </li>
          ))}
        </ul>
      )}

      {/* 맵 컨테이너 */}
      <div id="map" style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default KakaoMap;
