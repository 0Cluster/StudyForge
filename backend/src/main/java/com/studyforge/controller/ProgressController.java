package com.studyforge.controller;

import com.studyforge.model.Progress;
import com.studyforge.service.ProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/progress")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping("/topic/{topicId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Progress> getProgressByTopicId(@PathVariable Long topicId) {
        Progress progress = progressService.getProgressByTopicId(topicId);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/syllabus/{syllabusId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Progress>> getAllProgressBySyllabusId(@PathVariable Long syllabusId) {
        List<Progress> progressList = progressService.getAllProgressBySyllabusId(syllabusId);
        return ResponseEntity.ok(progressList);
    }

    @PutMapping("/topic/{topicId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Progress> updateProgress(
            @PathVariable Long topicId,
            @RequestParam Integer completionPercentage) {
        Progress updatedProgress = progressService.updateProgress(topicId, completionPercentage);
        return ResponseEntity.ok(updatedProgress);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProgress(@PathVariable Long id) {
        progressService.deleteProgress(id);
        return ResponseEntity.ok().build();
    }
}
