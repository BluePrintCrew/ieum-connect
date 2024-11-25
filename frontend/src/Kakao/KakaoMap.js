import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './KakaoMap.css';

const KakaoMap = ({ isSpotAdding, markers, setMarkers }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerObjects = useRef([]);
  const polylineObjects = useRef([]);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);

  // 카카오 맵 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_APP_API_KEY}&autoload=false&libraries=services,clusterer,places`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => setIsMapLoaded(true));
    };
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

  // 초기 맵 인스턴스 생성
  useEffect(() => {
    if (isMapLoaded && !mapInstance.current) {
      const initialCenter = markers.length > 0
        ? new window.kakao.maps.LatLng(markers[0].lat, markers[0].lng)
        : new window.kakao.maps.LatLng(37.5665, 126.9780); // 기본 좌표

      const mapOption = {
        center: initialCenter,
        level: 5,
      };
      mapInstance.current = new window.kakao.maps.Map(mapRef.current, mapOption);

      // Spot 추가 모드 변경 시 이벤트 리스너 추가/제거
      if (isSpotAdding) {
        window.kakao.maps.event.addListener(mapInstance.current, 'click', handleMapClick);
      }

      // 카카오 맵 로드 완료 로그
      console.log('카카오 맵이 로드되었습니다:', mapInstance.current);
    }
  }, [isMapLoaded]);

  // 마커 및 경로 업데이트
  useEffect(() => {
    if (mapInstance.current) {
      // 기존 마커와 경로 삭제
      markerObjects.current.forEach((marker) => marker.setMap(null));
      polylineObjects.current.forEach((polyline) => polyline.setMap(null));
      markerObjects.current = [];
      polylineObjects.current = [];

      // 새로운 마커 추가
      markers.forEach((markerData) => {
        const position = new window.kakao.maps.LatLng(markerData.lat, markerData.lng);
        const marker = new window.kakao.maps.Marker({
          map: mapInstance.current,
          position,
        });
        markerObjects.current.push(marker);
      });

      // 새로운 경로 추가
      if (markers.length > 1) {
        for (let i = 0; i < markers.length - 1; i++) {
          const start = markers[i];
          const end = markers[i + 1];
          getWalkingRouteFromTmap(start, end);
        }
      }

      if (markers.length > 0) {
        // 마커가 있으면 지도 범위 조정
        const bounds = new window.kakao.maps.LatLngBounds();
        markers.forEach((markerData) => {
          bounds.extend(new window.kakao.maps.LatLng(markerData.lat, markerData.lng));
        });
        mapInstance.current.setBounds(bounds);
      } else {
        // 마커가 없으면 기본 중심 좌표로 설정
        mapInstance.current.setCenter(new window.kakao.maps.LatLng(37.5665, 126.9780));
        mapInstance.current.setLevel(5);
      }
    }
  }, [markers]);

  // Spot 추가 모드 변경 시 이벤트 리스너 추가/제거
  useEffect(() => {
    if (mapInstance.current) {
      if (isSpotAdding) {
        window.kakao.maps.event.addListener(mapInstance.current, 'click', handleMapClick);
      } else {
        window.kakao.maps.event.removeListener(mapInstance.current, 'click', handleMapClick);
      }
    }
  }, [isSpotAdding]);

  // 지도 클릭 핸들러
  const handleMapClick = (mouseEvent) => {
    const latlng = mouseEvent.latLng;
    const newMarker = { lat: latlng.getLat(), lng: latlng.getLng() };
    setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
  };

  // Tmap 도보 경로 요청 함수
  const getWalkingRouteFromTmap = (start, end) => {
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
          polyline.setMap(mapInstance.current);
          polylineObjects.current.push(polyline);
        } else {
          console.warn('Tmap에서 경로 데이터를 가져오지 못했습니다.');
        }
      })
      .catch((error) => {
        console.error('Tmap 도보 경로 요청에 실패했습니다:', error);
      });
  };

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
        setSearchResults(data);
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
    mapInstance.current.setCenter(newCenter);

    setSearchResults([]);
    setIsSearchBarVisible(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px' }}>
      <button
        className="map-search-button"
        onClick={() => setIsSearchBarVisible(!isSearchBarVisible)}
      >
        🔍
      </button>

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

      <div id="map" ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default KakaoMap;
