import React, { useEffect, useState } from 'react';
import axios from 'axios';

const KakaoMap = ({ isSpotAdding, markers, setMarkers }) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [map, setMap] = useState(null);

  // Kakao Map API 스크립트를 동적으로 로드하고, 맵이 로드되면 상태를 업데이트하는 useEffect
  useEffect(() => {
    const script = document.createElement('script');
  
    // 명시적으로 https:// 사용
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_APP_API_KEY}&autoload=false`;
    script.async = true;
    script.onload = () => {
      // API가 완전히 로드된 후에만 isMapLoaded를 true로 설정
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => setIsMapLoaded(true));
      } else {
        console.error('카카오 맵 스크립트 로딩 실패');
      }
    };
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);
   
  // 맵이 로드된 후에 지도와 마커 관련 작업을 수행하는 useEffect
  useEffect(() => {
    if (isMapLoaded) {
      const mapContainer = document.getElementById('map');
      const mapOption = {
        center: new window.kakao.maps.LatLng(37.282, 127.046),
        level: 3,
      };
      const createdMap = new window.kakao.maps.Map(mapContainer, mapOption);
      setMap(createdMap);

      // 지도 클릭 시 마커 추가
      window.kakao.maps.event.addListener(createdMap, 'click', (mouseEvent) => {
        if (isSpotAdding) {
          const latlng = mouseEvent.latLng;
          const newMarker = { lat: latlng.getLat(), lng: latlng.getLng() };
          setMarkers((prevMarkers) => [...prevMarkers, newMarker]);

          const marker = new window.kakao.maps.Marker({ position: latlng, map: createdMap });
          window.kakao.maps.event.addListener(marker, 'click', () => {
            marker.setMap(null);
            setMarkers((prevMarkers) => prevMarkers.filter((m) => m.lat !== newMarker.lat || m.lng !== newMarker.lng));
          });
        }
      });

      // 기존 마커 표시
      markers.forEach((marker) => {
        const kakaoMarker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(marker.lat, marker.lng),
          map: createdMap,
        });
      });

      // 도보 경로 찾기 - 마커가 두 개 이상일 때만 수행
      if (markers.length > 1) {
        for (let i = 0; i < markers.length - 1; i++) {
          const start = markers[i];
          const end = markers[i + 1];
          getWalkingRouteFromTmap(start, end, createdMap);
        }
      }
    }
  }, [isMapLoaded, isSpotAdding, markers]);

  // Tmap API를 통해 도보 경로 데이터를 가져오는 함수
  const getWalkingRouteFromTmap = (start, end, map) => {
    const url = `https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json`;

    axios
      .post(url, {
        startX: start.lng,
        startY: start.lat,
        endX: end.lng,
        endY: end.lat,
        reqCoordType: 'WGS84GEO',
        resCoordType: 'WGS84GEO',
        startName: '출발지',
        endName: '도착지',
      }, {
        headers: {
          appKey: process.env.REACT_APP_TMAP_API_KEY,
        },
      })
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

  return <div id="map" style={{ width: '100%', height: '400px' }}></div>;
};

export default KakaoMap;
