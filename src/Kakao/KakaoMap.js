import React, { useEffect, useState } from 'react';

const KakaoMap = ({ isSpotAdding }) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false); // 지도 로드 상태
  const [markers, setMarkers] = useState([]); // 마커 배열
  const [map, setMap] = useState(null); // 지도 객체 상태 저장
  const [currentCenter, setCurrentCenter] = useState({ lat: 37.2804, lng: 127.0176 }); // 현재 중심 좌표 저장

  useEffect(() => {
    // 카카오 맵 스크립트를 동적으로 로드
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=a2ca7d06d92a3ddceb626bb7bcce2ab8&autoload=false`;
    script.async = true;

    // 스크립트 로드가 완료되면 실행
    script.onload = () => {
      window.kakao.maps.load(() => {
        setIsMapLoaded(true); // 지도 로드 완료 상태로 설정
      });
    };

    document.head.appendChild(script); // 스크립트를 head에 추가

    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (isMapLoaded) {
      const mapContainer = document.getElementById('map'); // 지도를 표시할 div
      const mapOption = {
        center: new window.kakao.maps.LatLng(currentCenter.lat, currentCenter.lng), // 현재 중심 좌표 사용
        level: 3, // 확대 레벨
      };

      // 지도 생성
      const createdMap = new window.kakao.maps.Map(mapContainer, mapOption);
      setMap(createdMap); // 지도 객체 저장

      // 지도의 중심이 변경될 때마다 새로운 좌표 저장
      window.kakao.maps.event.addListener(createdMap, 'center_changed', function () {
        const newCenter = createdMap.getCenter();
        setCurrentCenter({
          lat: newCenter.getLat(),
          lng: newCenter.getLng(),
        });
      });

      // 랜덤 색상 마커 생성 함수
      const getRandomColorMarkerImage = () => {
        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        const markerImageSrc = `http://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png`; // 기본 마커 이미지
        const imageSize = new window.kakao.maps.Size(24, 35); // 마커 이미지 크기
        const markerImage = new window.kakao.maps.MarkerImage(markerImageSrc, imageSize);

        return markerImage;
      };

      // 마커 클릭 이벤트 추가 함수
      const addMarker = (latlng) => {
        const newMarker = new window.kakao.maps.Marker({
          position: latlng,
          image: getRandomColorMarkerImage(), // 랜덤 색상 마커
        });

        // 새로운 마커를 지도에 표시
        newMarker.setMap(createdMap);

        // 마커 배열에 추가
        setMarkers((prevMarkers) => [...prevMarkers, newMarker]);

        // 마커 삭제 이벤트 리스너 (클릭 시 삭제)
        window.kakao.maps.event.addListener(newMarker, 'click', function () {
          if (!isSpotAdding) {
            newMarker.setMap(null); // 마커를 지도에서 삭제
            setMarkers((prevMarkers) => prevMarkers.filter(marker => marker !== newMarker)); // 상태에서도 제거
          } else {
            console.log('Spot 추가 모드가 꺼져 있습니다. 마커를 삭제할 수 없습니다.');
          }
        });
      };

      // Spot 추가 모드가 켜졌을 때만 마커를 추가
      const handleClick = (mouseEvent) => {
        if (isSpotAdding) {
          const latlng = mouseEvent.latLng; // 클릭한 위치의 위도, 경도
          addMarker(latlng); // 마커 추가 함수 호출
          console.log(latlng.getLat()); //위도 
          console.log(latlng.getLng()); //경도
        }
      };

      // 지도 클릭 이벤트 추가
      window.kakao.maps.event.addListener(createdMap, 'click', handleClick);

      // 기존 마커 상태 복원 (Spot 추가 모드를 켜고 끌 때 마커가 남아 있도록)
      markers.forEach(marker => marker.setMap(createdMap));

      // 컴포넌트 언마운트 시 이벤트 리스너 제거 (마커는 유지)
      return () => {
        window.kakao.maps.event.removeListener(createdMap, 'click', handleClick);
      };
    }
  }, [isMapLoaded, isSpotAdding, markers, currentCenter]); // markers 배열과 currentCenter 상태 의존성 추가

  return <div id="map" style={{ width: '100%', height: '300px' }}></div>;
};

export default KakaoMap;
