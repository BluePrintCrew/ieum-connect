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
          getDrivingRoute(start, end, createdMap);
        }
      }
    }
  }, [isMapLoaded, isSpotAdding, markers]);

  // 차량 경로를 가져오는 함수
  const getDrivingRoute = (start, end, map) => {
    const url = `https://apis-navi.kakaomobility.com/v1/directions`;
  
    console.log('경로 요청 좌표:', `origin: ${start.lng},${start.lat}`, `destination: ${end.lng},${end.lat}`);
  
    axios
      .get(url, {
        params: {
          origin: `${start.lng},${start.lat}`, // 경도, 위도 순서 확인
          destination: `${end.lng},${end.lat}`,
          priority: 'RECOMMEND', // 경로 우선순위 설정 (RECOMMEND, SHORTEST 등)
          vehicleType: '1', // 차량 타입 설정 (1: 일반 차량)
        },
        headers: {
          Authorization: `KakaoAK ${process.env.REACT_APP_KAKAO_REST_API_KEY}`,
        },
      })
      .then((response) => {
        // 전체 API 응답을 출력하여 응답 데이터 구조 확인
        console.log('API 응답:', response.data);
  
        const routes = response.data.routes;
        if (routes && routes.length > 0) {
          const route = routes[0];
          console.log('Routes 데이터:', route);
  
          if (route.sections && route.sections.length > 0) {
            const points = [];
  
            route.sections.forEach((section, sectionIndex) => {
              console.log(`Section ${sectionIndex}:`, section);
  
              // roads 필드가 있는 경우 사용 (우선적으로 roads 사용)
              if (section.roads && section.roads.length > 0) {
                section.roads.forEach((road, roadIndex) => {
                  console.log(`Road ${roadIndex}:`, road);
                  if (road.start && road.start.location && road.start.location.latitude && road.start.location.longitude) {
                    points.push(
                      new window.kakao.maps.LatLng(
                        road.start.location.latitude,
                        road.start.location.longitude
                      )
                    );
                  } else {
                    console.warn(`Road ${roadIndex}에 유효한 start location 데이터가 없습니다. 건너뜁니다.`);
                  }
  
                  if (road.end && road.end.location && road.end.location.latitude && road.end.location.longitude) {
                    points.push(
                      new window.kakao.maps.LatLng(
                        road.end.location.latitude,
                        road.end.location.longitude
                      )
                    );
                  } else {
                    console.warn(`Road ${roadIndex}에 유효한 end location 데이터가 없습니다. 건너뜁니다.`);
                  }
                });
              } 
              // guides 필드가 있는 경우 사용
              else if (section.guides && section.guides.length > 0) {
                section.guides.forEach((guide, guideIndex) => {
                  if (guide.location && guide.location.latitude && guide.location.longitude) {
                    points.push(
                      new window.kakao.maps.LatLng(
                        guide.location.latitude,
                        guide.location.longitude
                      )
                    );
                  } else {
                    console.warn(`Guide ${guideIndex}에 유효한 location 데이터가 없습니다. 건너뜁니다.`);
                  }
                });
              } else {
                console.warn(`Section ${sectionIndex}에 roads, guides 데이터가 없습니다. 건너뜁니다.`);
              }
            });
  
            if (points && points.length > 0) {
              // 폴리라인 그리기
              const polyline = new window.kakao.maps.Polyline({
                path: points,
                strokeWeight: 5,
                strokeColor: '#FF0000',
                strokeOpacity: 0.7,
                strokeStyle: 'solid',
              });
              polyline.setMap(map);

              // 지도의 중심과 확대 수준을 폴리라인 경로에 맞게 조정
              const bounds = new window.kakao.maps.LatLngBounds();
              points.forEach((point) => bounds.extend(point));
              map.setBounds(bounds);
            } else {
              console.warn('경로 데이터의 points가 비어 있습니다. 기본 직선을 그립니다.');
              drawSimpleLine(start, end, map);
            }
          } else {
            console.warn('경로 데이터의 sections가 없습니다. 기본 직선을 그립니다.');
            drawSimpleLine(start, end, map);
          }
        } else {
          console.warn('경로 데이터가 없습니다. 기본 직선을 그립니다.');
          drawSimpleLine(start, end, map);
        }
      })
      .catch((error) => {
        console.error('경로를 가져오는데 실패했습니다:', error);
        drawSimpleLine(start, end, map);
      });
  };

  // 간단히 두 지점 간 직선을 그리는 함수
  const drawSimpleLine = (start, end, map) => {
    const points = [
      new window.kakao.maps.LatLng(start.lat, start.lng),
      new window.kakao.maps.LatLng(end.lat, end.lng),
    ];
    const polyline = new window.kakao.maps.Polyline({
      path: points,
      strokeWeight: 5,
      strokeColor: '#00FF00',
      strokeOpacity: 0.7,
      strokeStyle: 'solid',
    });
    polyline.setMap(map);
  };

  return <div id="map" style={{ width: '100%', height: '300px' }}></div>;
};

export default KakaoMap;
