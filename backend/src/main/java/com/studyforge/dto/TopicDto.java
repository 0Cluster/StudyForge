package com.studyforge.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.studyforge.model.Topic;
import java.time.LocalDateTime;
import java.util.List;

public class TopicDto {
    private Long id;
    private String title;
    private String content;
    private int estimatedDurationMinutes;
    private int orderIndex;
    private List<String> keyTerms;
    private List<String> learningObjectives;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime deadline;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
    
    // Default constructor
    public TopicDto() {
    }
    
    // Constructor from Topic entity
    public TopicDto(Topic topic) {
        this.id = topic.getId();
        this.title = topic.getTitle();
        this.content = topic.getContent();
        this.estimatedDurationMinutes = topic.getEstimatedDurationMinutes() != null ? topic.getEstimatedDurationMinutes() : 0;
        this.orderIndex = topic.getOrderIndex() != null ? topic.getOrderIndex() : 0;
        this.deadline = topic.getDeadline();
        this.createdAt = topic.getCreatedAt();
        this.updatedAt = topic.getUpdatedAt();
    }
    
    // Getters and setters
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public int getEstimatedDurationMinutes() {
        return estimatedDurationMinutes;
    }
    
    public void setEstimatedDurationMinutes(int estimatedDurationMinutes) {
        this.estimatedDurationMinutes = estimatedDurationMinutes;
    }
    
    public int getOrderIndex() {
        return orderIndex;
    }
    
    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
    }
    
    public List<String> getKeyTerms() {
        return keyTerms;
    }
    
    public void setKeyTerms(List<String> keyTerms) {
        this.keyTerms = keyTerms;
    }
    
    public List<String> getLearningObjectives() {
        return learningObjectives;
    }
    
    public void setLearningObjectives(List<String> learningObjectives) {
        this.learningObjectives = learningObjectives;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public LocalDateTime getDeadline() {
        return deadline;
    }
    
    public void setDeadline(LocalDateTime deadline) {
        this.deadline = deadline;
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
