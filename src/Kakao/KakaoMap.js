import React, { useEffect, useState } from 'react';

const KakaoMap = ({ isSpotAdding, markers, setMarkers }) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [map, setMap] = useState(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=a2ca7d06d92a3ddceb626bb7bcce2ab8&autoload=false`;
    script.async = true;
    script.onload = () => window.kakao.maps.load(() => setIsMapLoaded(true));
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

  useEffect(() => {
    if (isMapLoaded) {
      const mapContainer = document.getElementById('map');
      const mapOption = {
        center: new window.kakao.maps.LatLng(37.2804, 127.0176),
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
            setMarkers((prevMarkers) => prevMarkers.filter((m) => m.lat !== newMarker.lat && m.lng !== newMarker.lng));
          });
        }
      });

      // 마커 표시
      markers.forEach((marker) => {
        const kakaoMarker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(marker.lat, marker.lng),
          map: createdMap,
        });
      });

      // 폴리라인 추가
      if (markers.length > 1) {
        const linePath = markers.map((marker) => new window.kakao.maps.LatLng(marker.lat, marker.lng));
        const polyline = new window.kakao.maps.Polyline({
          path: linePath, // 경로를 설정합니다
          strokeWeight: 5, // 선의 두께입니다
          strokeColor: '#FF0000', // 선의 색깔입니다
          strokeOpacity: 0.7, // 선의 불투명도입니다
          strokeStyle: 'solid', // 선의 스타일입니다
        });

        polyline.setMap(createdMap);
      }
    }
  }, [isMapLoaded, isSpotAdding, markers]);

  return <div id="map" style={{ width: '100%', height: '300px' }}></div>;
};

export default KakaoMap;
