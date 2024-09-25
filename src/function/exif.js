import EXIF from 'exif-js';

// GPS 좌표를 십진수로 변환하는 함수
const convertToDecimal = (gpsData) => {
  const degrees = gpsData[0];
  const minutes = gpsData[1];
  const seconds = gpsData[2];
  return degrees + minutes / 60 + seconds / 3600;
};

// EXIF 데이터를 추출하는 함수
export const extractExifData = (file, callback) => {
  EXIF.getData(file, function () {
    const gpsLat = EXIF.getTag(this, 'GPSLatitude');
    const gpsLon = EXIF.getTag(this, 'GPSLongitude');
    const dateTime = EXIF.getTag(this, 'DateTimeOriginal'); // 타임스탬프

    if (gpsLat && gpsLon) {
      const latDecimal = convertToDecimal(gpsLat);
      const lonDecimal = convertToDecimal(gpsLon);

      // 콜백 함수를 통해 추출한 데이터 반환
      callback({
        latitude: latDecimal,
        longitude: lonDecimal,
        dateTime: dateTime
      });
    } else {
      console.log('GPS 정보가 없습니다.');
    }
  });
};
