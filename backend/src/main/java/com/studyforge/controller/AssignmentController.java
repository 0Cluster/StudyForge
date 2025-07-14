package com.studyforge.controller;

import com.studyforge.dto.AssignmentEvaluationRequest;
import com.studyforge.dto.AssignmentRequest;
import com.studyforge.model.Assignment;
import com.studyforge.service.AssignmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assignments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Assignment> createAssignment(@Valid @RequestBody AssignmentRequest assignmentRequest) {
        Assignment assignment = new Assignment();
        assignment.setTitle(assignmentRequest.getTitle());
        assignment.setContent(assignmentRequest.getDescription()); // Using description from DTO but setting content in model
        assignment.setDifficultyLevel(assignmentRequest.getDifficultyLevel());
        
        Assignment newAssignment = assignmentService.createAssignment(assignment, assignmentRequest.getTopicId());
        return ResponseEntity.ok(newAssignment);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Assignment> getAssignment(@PathVariable Long id) {
        Assignment assignment = assignmentService.getAssignment(id);
        return ResponseEntity.ok(assignment);
    }

    @GetMapping("/topic/{topicId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Assignment>> getAllAssignmentsByTopic(@PathVariable Long topicId) {
        List<Assignment> assignments = assignmentService.getAllAssignmentsByTopicId(topicId);
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/topic/{topicId}/difficulty/{difficultyLevel}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Assignment>> getAssignmentsByDifficulty(
            @PathVariable Long topicId,
            @PathVariable String difficultyLevel) {
        List<Assignment> assignments = assignmentService.getAllAssignmentsByTopicId(topicId); // We need to implement this method
        return ResponseEntity.ok(assignments.stream()
                .filter(a -> a.getDifficultyLevel().toString().equals(difficultyLevel.toUpperCase()))
                .toList());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Assignment> updateAssignment(@PathVariable Long id, @RequestBody Assignment assignmentDetails) {
        Assignment updatedAssignment = assignmentService.updateAssignment(id, assignmentDetails);
        return ResponseEntity.ok(updatedAssignment);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{topicId}/generate-assignments")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Assignment>> generateAssignments(@PathVariable Long topicId) {
        List<Assignment> assignments = assignmentService.generateAssignmentsForTopic(topicId);
        return ResponseEntity.ok(assignments);
    }

    @PostMapping("/submit")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Assignment> submitAssignment(@Valid @RequestBody AssignmentEvaluationRequest evaluationRequest) {
        assignmentService.evaluateAssignment(
            evaluationRequest.getAssignmentId(),
            evaluationRequest.getQuestionIds(),
            evaluationRequest.getUserAnswers()
        );
        Assignment assignment = assignmentService.getAssignment(evaluationRequest.getAssignmentId());
        return ResponseEntity.ok(assignment);
    }
}
