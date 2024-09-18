//package org.example.backend.controller;
//import com.drew.imaging.ImageMetadataReader;
//import com.drew.metadata.Metadata;
//import com.drew.metadata.exif.GpsDirectory;
//import com.drew.metadata.exif.ExifSubIFDDirectory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.time.LocalDateTime;
//import java.time.ZoneOffset;
//import java.util.ArrayList;
//import java.util.Comparator;
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/photos")
//public class PhotoController {
//
//    @Autowired
//    private PhotoService photoService;
//
//    @PostMapping("/upload")
//    public ResponseEntity<?> uploadPhotos(@RequestParam("files") List<MultipartFile> files,
//                                          @RequestParam("storyId") Long storyId) {
//        try {
//            List<RoutePointDTO> routePoints = photoService.processPhotos(files, storyId);
//            return ResponseEntity.ok(routePoints);
//        } catch (IOException e) {
//            return ResponseEntity.badRequest().body("Error processing photos: " + e.getMessage());
//        }
//    }
//}