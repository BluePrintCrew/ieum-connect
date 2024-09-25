import EXIF from 'exif-js';

// GPS 좌표를 십진수로 변환하는 함수
const convertToDecimal = (gpsData) => {
  if (!gpsData || gpsData.length < 3) return null;
  const degrees = gpsData[0];
  const minutes = gpsData[1];
  const seconds = gpsData[2];
  const decimal = degrees + (minutes / 60) + (seconds / 3600);
  return decimal;
};

// EXIF 데이터를 추출하는 함수
export const extractExifData = (file, callback) => {
  EXIF.getData(file, function () {
    console.log('EXIF 데이터 추출 시작');
    const allExifData = EXIF.getAllTags(this); // 전체 EXIF 데이터 확인
    console.log('전체 EXIF 데이터:', allExifData); // EXIF 데이터 디버깅 용도로 출력

    const gpsLat = EXIF.getTag(this, 'GPSLatitude');
    const gpsLon = EXIF.getTag(this, 'GPSLongitude');
    const gpsLatRef = EXIF.getTag(this, 'GPSLatitudeRef');
    const gpsLonRef = EXIF.getTag(this, 'GPSLongitudeRef');
    const dateTime = EXIF.getTag(this, 'DateTimeOriginal'); // 타임스탬프 정보

    // GPS 정보 디버깅 로그
    console.log('GPSLatitude:', gpsLat);
    console.log('GPSLongitude:', gpsLon);
    console.log('GPSLatitudeRef:', gpsLatRef);
    console.log('GPSLongitudeRef:', gpsLonRef);

    // GPS 정보가 있는지 확인
    if (gpsLat && gpsLon && gpsLatRef && gpsLonRef) {
      let latDecimal = convertToDecimal(gpsLat);
      let lonDecimal = convertToDecimal(gpsLon);

      // 북위/남위, 동경/서경을 반영하여 조정
      if (gpsLatRef === 'S') latDecimal = -latDecimal;
      if (gpsLonRef === 'W') lonDecimal = -lonDecimal;

      // GPS 정보 반환
      callback({
        latitude: latDecimal,
        longitude: lonDecimal,
        dateTime: dateTime || '시간 정보 없음',
      });
    } else {
      console.log('GPS 정보가 없습니다.');
      callback(null); // GPS 정보가 없는 경우
    }
  });
};
