export const getAddressFromCoords = (latitude, longitude, callback) => {
  // Kakao 지도 API가 로드되었는지 확인
  if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
    const geocoder = new window.kakao.maps.services.Geocoder();
    const coords = new window.kakao.maps.LatLng(latitude, longitude);

    geocoder.coord2Address(coords.getLng(), coords.getLat(), (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const address = result[0]?.road_address?.address_name || result[0]?.address?.address_name;
        callback(address);
      } else {
        console.error('Failed to get address from coordinates');
        callback(null);
      }
    });
  } else {
    console.error('Kakao Maps API is not loaded yet');
    callback(null);
  }
};
