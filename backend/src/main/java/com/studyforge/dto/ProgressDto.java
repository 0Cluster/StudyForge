package com.studyforge.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.studyforge.model.Progress;

import java.time.LocalDateTime;

public class ProgressDto {
    private Long id;
    private boolean completed;
    private Integer completionPercentage;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startedAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime completedAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
    
    private Long topicId;
    private String topicTitle;
    
    // Default constructor
    public ProgressDto() {}
    
    // Constructor from entity
    public ProgressDto(Progress progress) {
        this.id = progress.getId();
        this.completed = progress.isCompleted();
        this.completionPercentage = progress.getCompletionPercentage();
        this.startedAt = progress.getStartedAt();
        this.completedAt = progress.getCompletedAt();
        this.createdAt = progress.getCreatedAt();
        this.updatedAt = progress.getUpdatedAt();
        
        if (progress.getTopic() != null) {
            this.topicId = progress.getTopic().getId();
            this.topicTitle = progress.getTopic().getTitle();
        }
    }
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public boolean isCompleted() {
        return completed;
    }
    
    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
    
    public Integer getCompletionPercentage() {
        return completionPercentage;
    }
    
    public void setCompletionPercentage(Integer completionPercentage) {
        this.completionPercentage = completionPercentage;
    }
    
    public LocalDateTime getStartedAt() {
        return startedAt;
    }
    
    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }
    
    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
    
    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
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
    
    public Long getTopicId() {
        return topicId;
    }
    
    public void setTopicId(Long topicId) {
        this.topicId = topicId;
    }
    
    public String getTopicTitle() {
        return topicTitle;
    }
    
    public void setTopicTitle(String topicTitle) {
        this.topicTitle = topicTitle;
    }
}
