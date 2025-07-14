package com.studyforge.controller;

import com.studyforge.dto.DocumentProcessingRequest;
import com.studyforge.model.Syllabus;
import com.studyforge.model.Topic;
import com.studyforge.service.SyllabusService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/syllabi")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SyllabusController {

    private final SyllabusService syllabusService;

    public SyllabusController(SyllabusService syllabusService) {
        this.syllabusService = syllabusService;
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Syllabus> createSyllabus(@RequestBody Syllabus syllabus, @RequestParam Long userId) {
        Syllabus newSyllabus = syllabusService.createSyllabus(syllabus, userId);
        return ResponseEntity.ok(newSyllabus);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Syllabus> getSyllabus(@PathVariable Long id) {
        Syllabus syllabus = syllabusService.getSyllabus(id);
        return ResponseEntity.ok(syllabus);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Syllabus>> getAllSyllabiByUser(@PathVariable Long userId) {
        List<Syllabus> syllabi = syllabusService.getAllSyllabiByUserId(userId);
        return ResponseEntity.ok(syllabi);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Syllabus> updateSyllabus(@PathVariable Long id, @RequestBody Syllabus syllabusDetails) {
        Syllabus updatedSyllabus = syllabusService.updateSyllabus(id, syllabusDetails);
        return ResponseEntity.ok(updatedSyllabus);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSyllabus(@PathVariable Long id) {
        syllabusService.deleteSyllabus(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Syllabus> uploadSyllabus(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("userId") Long userId) {
        Syllabus syllabus = syllabusService.processDocument(file, title, description, userId);
        return ResponseEntity.ok(syllabus);
    }

    @PostMapping("/{syllabusId}/generate-topics")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Topic>> generateTopics(@PathVariable Long syllabusId) {
        List<Topic> topics = syllabusService.generateTopicsFromSyllabus(syllabusId);
        return ResponseEntity.ok(topics);
    }
}
