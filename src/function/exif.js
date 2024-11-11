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
    const allExifData = EXIF.getAllTags(this); // 전체 EXIF 데이터
    const gpsLat = EXIF.getTag(this, 'GPSLatitude');
    const gpsLon = EXIF.getTag(this, 'GPSLongitude');
    const gpsLatRef = EXIF.getTag(this, 'GPSLatitudeRef');
    const gpsLonRef = EXIF.getTag(this, 'GPSLongitudeRef');
    const dateTime = EXIF.getTag(this, 'DateTimeOriginal'); // 타임스탬프 정보

    if (gpsLat && gpsLon && gpsLatRef && gpsLonRef) {
      let latDecimal = convertToDecimal(gpsLat);
      let lonDecimal = convertToDecimal(gpsLon);
      if (gpsLatRef === 'S') latDecimal = -latDecimal;
      if (gpsLonRef === 'W') lonDecimal = -lonDecimal;

      callback({
        latitude: latDecimal,
        longitude: lonDecimal,
        dateTime: dateTime || '시간 정보 없음',
      });
    } else {
      console.log('GPS 정보가 없습니다.');
      callback(null);
    }
  });
};
