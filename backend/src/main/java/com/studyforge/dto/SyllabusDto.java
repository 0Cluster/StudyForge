package com.studyforge.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.studyforge.model.Syllabus;
import com.studyforge.model.Topic;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class SyllabusDto {
    private Long id;
    private String title;
    private String description;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startDate;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endDate;
    private String originalDocumentUrl;
    private Syllabus.DocumentType documentType;
    private Long userId;
    private String userFullName;
    private List<TopicDto> topics;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    // Default constructor
    public SyllabusDto() {}
    
    // Constructor that builds from entity
    public SyllabusDto(Syllabus syllabus) {
        this.id = syllabus.getId();
        this.title = syllabus.getTitle();
        this.description = syllabus.getDescription();
        this.startDate = syllabus.getStartDate();
        this.endDate = syllabus.getEndDate();
        this.originalDocumentUrl = syllabus.getOriginalDocumentUrl();
        this.documentType = syllabus.getDocumentType();
        
        if (syllabus.getUser() != null) {
            this.userId = syllabus.getUser().getId();
            this.userFullName = syllabus.getUser().getFirstName() + " " + syllabus.getUser().getLastName();
        }
        
        if (syllabus.getTopics() != null) {
            this.topics = syllabus.getTopics().stream()
                .map(TopicDto::new)
                .collect(Collectors.toList());
        }
        
        this.createdAt = syllabus.getCreatedAt();
        this.updatedAt = syllabus.getUpdatedAt();
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public String getOriginalDocumentUrl() {
        return originalDocumentUrl;
    }

    public void setOriginalDocumentUrl(String originalDocumentUrl) {
        this.originalDocumentUrl = originalDocumentUrl;
    }

    public Syllabus.DocumentType getDocumentType() {
        return documentType;
    }

    public void setDocumentType(Syllabus.DocumentType documentType) {
        this.documentType = documentType;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserFullName() {
        return userFullName;
    }

    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
    }

    public List<TopicDto> getTopics() {
        return topics;
    }

    public void setTopics(List<TopicDto> topics) {
        this.topics = topics;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}