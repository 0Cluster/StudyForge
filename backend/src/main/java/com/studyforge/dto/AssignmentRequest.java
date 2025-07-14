package com.studyforge.dto;

import com.studyforge.model.Assignment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AssignmentRequest {
    @NotBlank
    private String title;
    
    private String description;
    
    @NotNull
    private Assignment.DifficultyLevel difficultyLevel;
    
    @NotNull
    private Long topicId;

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

    public Assignment.DifficultyLevel getDifficultyLevel() {
        return difficultyLevel;
    }

    public void setDifficultyLevel(Assignment.DifficultyLevel difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }

    public Long getTopicId() {
        return topicId;
    }

    public void setTopicId(Long topicId) {
        this.topicId = topicId;
    }
}
