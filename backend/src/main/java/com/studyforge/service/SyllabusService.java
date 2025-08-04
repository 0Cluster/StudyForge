package com.studyforge.service;

import com.studyforge.model.Syllabus;
import com.studyforge.model.Topic;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface SyllabusService {
    Syllabus createSyllabus(Syllabus syllabus, Long userId);
    Syllabus getSyllabus(Long id);
    List<Syllabus> getAllSyllabiByUserId(Long userId);
    Syllabus updateSyllabus(Long id, Syllabus syllabusDetails);
    void deleteSyllabus(Long id);
    Syllabus processDocument(MultipartFile file, String title, String description, Long userId, 
                        java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
    Syllabus processDocument(MultipartFile file, String title, String description, Long userId);
    List<Topic> generateTopicsFromSyllabus(Long syllabusId);
    Syllabus getSyllabusWithDetails(Long id);

}
