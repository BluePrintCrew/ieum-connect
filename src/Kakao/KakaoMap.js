import React, { useEffect, useState } from 'react';
import axios from 'axios';

const KakaoMap = ({ center, isSpotAdding, markers, setMarkers }) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [map, setMap] = useState(null);

  // Kakao Map API 스크립트 로드 및 맵 로드 후 상태 업데이트
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_APP_API_KEY}&autoload=false&libraries=services`;
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

  // 맵이 로드된 후 지도와 마커 관련 작업을 수행하는 useEffect
  useEffect(() => {
    if (isMapLoaded) {
      const mapContainer = document.getElementById('map');
      const mapOption = {
        center: new window.kakao.maps.LatLng(center?.lat || 37.2838, center?.lng || 127.0454), // 전달받은 중심 좌표 설정, 없을 경우 아주대학교 좌표 사용
        level: 5,
      };
      const createdMap = new window.kakao.maps.Map(mapContainer, mapOption);
      setMap(createdMap);

      // 지도 클릭 시 마커 추가 기능
      if (isSpotAdding) {
        window.kakao.maps.event.addListener(createdMap, 'click', (mouseEvent) => {
          const latlng = mouseEvent.latLng;
          const newMarker = { lat: latlng.getLat(), lng: latlng.getLng() };
          setMarkers((prevMarkers) => [...prevMarkers, newMarker]);

          const marker = new window.kakao.maps.Marker({ position: latlng, map: createdMap });
          window.kakao.maps.event.addListener(marker, 'click', () => {
            marker.setMap(null);
            setMarkers((prevMarkers) => prevMarkers.filter((m) => m.lat !== newMarker.lat || m.lng !== newMarker.lng));
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

      // 경로 표시 - 마커가 두 개 이상일 때만 수행
      if (markers.length > 1) {
        for (let i = 0; i < markers.length - 1; i++) {
          const start = markers[i];
          const end = markers[i + 1];
          getWalkingRouteFromTmap(start, end, createdMap);
        }
      }
    }
  }, [isMapLoaded, markers, isSpotAdding, center]);

  // Tmap API를 통해 도보 경로 데이터를 가져오는 함수
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

  return <div id="map" style={{ width: '100%', height: '400px' }}></div>;
};

export default KakaoMap;
