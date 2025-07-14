package com.studyforge.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public class AssignmentEvaluationRequest {
    @NotNull
    private Long assignmentId;
    
    @NotNull
    private List<Long> questionIds;
    
    @NotNull
    private List<String> userAnswers;

    public Long getAssignmentId() {
        return assignmentId;
    }

    public void setAssignmentId(Long assignmentId) {
        this.assignmentId = assignmentId;
    }

    public List<Long> getQuestionIds() {
        return questionIds;
    }

    public void setQuestionIds(List<Long> questionIds) {
        this.questionIds = questionIds;
    }

    public List<String> getUserAnswers() {
        return userAnswers;
    }

    public void setUserAnswers(List<String> userAnswers) {
        this.userAnswers = userAnswers;
    }
}
