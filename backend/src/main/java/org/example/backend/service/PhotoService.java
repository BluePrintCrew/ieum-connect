package org.example.backend.service;

import org.apache.commons.imaging.ImageReadException;
import org.apache.commons.imaging.Imaging;
import org.apache.commons.imaging.common.ImageMetadata;
import org.apache.commons.imaging.formats.jpeg.JpegImageMetadata;
import org.apache.commons.imaging.formats.tiff.TiffImageMetadata;
import org.apache.commons.imaging.formats.tiff.constants.ExifTagConstants;
import org.example.backend.dto.PhotoInfoDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.logging.Logger;


@Service
public class PhotoService {
    private static final Logger logger = Logger.getLogger(PhotoService.class.getName());

    //메타데이터 추출
    static public PhotoInfoDTO extractMetadata(MultipartFile photo) throws IOException, ImageReadException {
        String fileName = photo.getOriginalFilename();
        logger.info("지금 받은 파일 이름: " + fileName);

        if (fileName == null || !(fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg"))) {
            logger.warning("지정된 형식이 아님: " + fileName);
            throw new IllegalArgumentException("지정된 파일 형식이 아닙니다.");
        }

        try (InputStream inputStream = photo.getInputStream()) {
            ImageMetadata metadata = Imaging.getMetadata(inputStream, fileName);

            if (metadata == null) {
                logger.warning("해당파일에서 메타데이터를 찾을 수 없습니다: " + fileName);
                return null;
            }

            if (metadata instanceof JpegImageMetadata) {
                JpegImageMetadata jpegMetadata = (JpegImageMetadata) metadata;
                logger.info("JPEG 메타데이터 발견");

                TiffImageMetadata exif = jpegMetadata.getExif();

                if (exif != null) {
                    logger.info("EXIF 데이터 발견");
                    TiffImageMetadata.GPSInfo gps = exif.getGPS();
                    if (gps != null) {
                        logger.info("GPS 데이터 발견");
                        BigDecimal latitude = BigDecimal.valueOf(gps.getLatitudeAsDegreesNorth());
                        BigDecimal longitude = BigDecimal.valueOf(gps.getLongitudeAsDegreesEast());
                        String dateTime = Arrays.toString(exif.getFieldValue(ExifTagConstants.EXIF_TAG_DATE_TIME_ORIGINAL));

                        logger.info("추출된 데이터 - Latitude: " + latitude + ", Longitude: " + longitude + ", DateTime: " + dateTime);
                        return new PhotoInfoDTO(fileName, latitude, longitude, dateTime,0);
                    } else {
                        logger.warning("EXIF에 데이터가 존재하지 않습니다.");
                    }
                } else {
                    logger.warning("EXIF 데이터를 찾을 수 없습니다.");
                }
            } else {
                logger.warning("JPEG 메타데이터 타입이 아닙니다.");
            }
        } catch (IOException | ImageReadException e) {
            logger.severe("해당 데이터를 추출하지 못했습니다: " + e.getMessage());
            throw e;
        }

        return null;
    }
}