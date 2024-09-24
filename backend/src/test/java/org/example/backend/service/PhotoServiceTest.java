package org.example.backend.service;

import static org.junit.jupiter.api.Assertions.*;

import org.apache.commons.imaging.ImageReadException;
import org.example.backend.dto.PhotoInfoDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

class PhotoServiceTest {

    private PhotoService photoService;

    @BeforeEach
    void setUp() {
        photoService = new PhotoService();
    }

    @Test
    void testExtractMetadata() throws IOException, ImageReadException {
        // 테스트용 JPEG 파일 경로
        String filePath = "C:\\Users\\guswp\\Desktop\\KakaoTalk_20240923_205645289.jpg";
        File file = new File(filePath);

        // MockMultipartFile 생성
        FileInputStream input = new FileInputStream(file);
        MultipartFile multipartFile = new MockMultipartFile("file",
                file.getName(), "image/jpeg", input);

        // extractMetadata 메소드 호출
        PhotoInfoDTO result = photoService.extractMetadata(multipartFile);

        // 결과 검증
        assertNotNull(result, "추출된 메타데이터는 null이 아니어야 합니다.");
        assertEquals(file.getName(), result.getFileName(), "파일 이름이 일치해야 합니다.");
        assertTrue(result.getLatitude() != 0, "위도 값이 있어야 합니다.");
        assertTrue(result.getLongitude() != 0, "경도 값이 있어야 합니다.");
        assertNotNull(result.getTakenAt(), "날짜 및 시간 정보가 있어야 합니다.");

        // 구체적인 값 검증 (실제 이미지의 메타데이터에 따라 조정 필요)
        // assertEquals(expectedLatitude, result.getLatitude(), 0.0001);
        // assertEquals(expectedLongitude, result.getLongitude(), 0.0001);
        // assertTrue(result.getDateTime().contains("예상되는 날짜 형식"));
    }

    @Test
    void testExtractMetadataWithNonJpegFile() throws IOException, ImageReadException {
        // JPEG가 아닌 파일로 테스트 (예: txt 파일)
        String filePath = "path/to/your/test/file.txt";
        File file = new File(filePath);

        FileInputStream input = new FileInputStream(file);
        MultipartFile multipartFile = new MockMultipartFile("file",
                file.getName(), "text/plain", input);

        PhotoInfoDTO result = photoService.extractMetadata(multipartFile);

        assertNull(result, "JPEG가 아닌 파일에 대해 null을 반환해야 합니다.");
    }
}