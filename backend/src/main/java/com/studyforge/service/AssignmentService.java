package com.studyforge.service;

import com.studyforge.model.Assignment;

import java.util.List;

public interface AssignmentService {
    Assignment createAssignment(Assignment assignment, Long topicId);
    Assignment getAssignment(Long id);
    List<Assignment> getAllAssignmentsByTopicId(Long topicId);
    Assignment updateAssignment(Long id, Assignment assignmentDetails);
    void deleteAssignment(Long id);
    List<Assignment> generateAssignmentsForTopic(Long topicId);
    void evaluateAssignment(Long id, List<Long> questionIds, List<String> userAnswers);
}
