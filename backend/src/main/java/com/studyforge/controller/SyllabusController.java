package com.studyforge.controller;

import com.studyforge.dto.DocumentProcessingRequest;
import com.studyforge.dto.SyllabusDto;
import com.studyforge.dto.TopicDto;
import com.studyforge.model.Syllabus;
import com.studyforge.model.Topic;
import com.studyforge.service.SyllabusService;
import java.time.LocalDateTime;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/syllabi")
public class SyllabusController {

    private final SyllabusService syllabusService;

    public SyllabusController(SyllabusService syllabusService) {
        this.syllabusService = syllabusService;
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<SyllabusDto> createSyllabus(@RequestBody Syllabus syllabus, @RequestParam Long userId) {
        Syllabus newSyllabus = syllabusService.createSyllabus(syllabus, userId);
        return ResponseEntity.ok(new SyllabusDto(newSyllabus));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<SyllabusDto> getSyllabus(@PathVariable Long id) {
        Syllabus syllabus = syllabusService.getSyllabus(id);
        return ResponseEntity.ok(new SyllabusDto(syllabus));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<SyllabusDto>> getAllSyllabiByUser(@PathVariable Long userId) {
        List<Syllabus> syllabi = syllabusService.getAllSyllabiByUserId(userId);
        List<SyllabusDto> syllabiDtos = syllabi.stream()
            .map(SyllabusDto::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(syllabiDtos);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<SyllabusDto> updateSyllabus(@PathVariable Long id, @RequestBody Syllabus syllabusDetails) {
        Syllabus updatedSyllabus = syllabusService.updateSyllabus(id, syllabusDetails);
        return ResponseEntity.ok(new SyllabusDto(updatedSyllabus));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSyllabus(@PathVariable Long id) {
        syllabusService.deleteSyllabus(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<SyllabusDto> uploadSyllabus(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("userId") Long userId) {
        Syllabus syllabus = syllabusService.processDocument(file, title, description, userId);
        return ResponseEntity.ok(new SyllabusDto(syllabus));
    }
    
    @PostMapping("/upload-with-dates")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<SyllabusDto> uploadSyllabusWithDates(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("userId") Long userId,
            @RequestParam(value = "startDate", required = false) String startDateStr,
            @RequestParam(value = "endDate", required = false) String endDateStr) {
        
        // Convert String dates to LocalDateTime objects
        LocalDateTime startDate = null;
        LocalDateTime endDate = null;
        
        if (startDateStr != null && !startDateStr.isEmpty()) {
            startDate = LocalDateTime.parse(startDateStr + "T00:00:00");
        }
        
        if (endDateStr != null && !endDateStr.isEmpty()) {
            endDate = LocalDateTime.parse(endDateStr + "T23:59:59");
        }
        
        Syllabus syllabus = syllabusService.processDocument(file, title, description, userId, startDate, endDate);
        return ResponseEntity.ok(new SyllabusDto(syllabus));
    }
    
    @PostMapping("/process")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<SyllabusDto> processDocument(
            @RequestPart("file") MultipartFile file,
            @RequestPart("request") DocumentProcessingRequest request) {
        // Process dates from the request
        LocalDateTime startDate = null;
        LocalDateTime endDate = null;
        
        if (request.getStartDate() != null) {
            try {
                startDate = LocalDateTime.parse(request.getStartDate() + "T00:00:00");
            } catch (Exception e) {
                // Log error but continue processing
                System.err.println("Error parsing start date: " + e.getMessage());
            }
        }
        
        if (request.getEndDate() != null) {
            try {
                endDate = LocalDateTime.parse(request.getEndDate() + "T23:59:59");
            } catch (Exception e) {
                // Log error but continue processing
                System.err.println("Error parsing end date: " + e.getMessage());
            }
        }
        
        Syllabus syllabus = syllabusService.processDocument(file, 
                                                          request.getTitle(), 
                                                          request.getDescription(), 
                                                          request.getUserId(), 
                                                          startDate, 
                                                          endDate);
        return ResponseEntity.ok(new SyllabusDto(syllabus));
    }

    @PostMapping("/{syllabusId}/generate-topics")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<TopicDto>> generateTopics(@PathVariable Long syllabusId) {
        List<Topic> topics = syllabusService.generateTopicsFromSyllabus(syllabusId);
        List<TopicDto> topicDtos = topics.stream()
            .map(TopicDto::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(topicDtos);
    }
}
