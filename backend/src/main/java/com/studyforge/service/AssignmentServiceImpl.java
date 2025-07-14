package com.studyforge.service;

import com.studyforge.model.Assignment;
import com.studyforge.model.Question;
import com.studyforge.model.QuestionOption;
import com.studyforge.repository.AssignmentRepository;
import com.studyforge.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import jakarta.persistence.EntityNotFoundException;

@Service
public class AssignmentServiceImpl implements AssignmentService {

    @Value("${openai.api.key}")
    private String openaiApiKey;

    @Value("${openai.model}")
    private String openaiModel;

    private final AssignmentRepository assignmentRepository;
    private final TopicRepository topicRepository;

    public AssignmentServiceImpl(AssignmentRepository assignmentRepository, TopicRepository topicRepository) {
        this.assignmentRepository = assignmentRepository;
        this.topicRepository = topicRepository;
    }

    @Override
    public Assignment createAssignment(Assignment assignment, Long topicId) {
        return topicRepository.findById(topicId)
                .map(topic -> {
                    assignment.setTopic(topic);
                    assignment.setCreatedAt(LocalDateTime.now());
                    return assignmentRepository.save(assignment);
                })
                .orElseThrow(() -> new EntityNotFoundException("Topic not found with id: " + topicId));
    }

    @Override
    public Assignment getAssignment(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Assignment not found with id: " + id));
    }

    @Override
    public List<Assignment> getAllAssignmentsByTopicId(Long topicId) {
        return assignmentRepository.findByTopicId(topicId);
    }

    @Override
    public Assignment updateAssignment(Long id, Assignment assignmentDetails) {
        return assignmentRepository.findById(id)
                .map(assignment -> {
                    assignment.setTitle(assignmentDetails.getTitle());
                    assignment.setContent(assignmentDetails.getContent());
                    assignment.setDifficultyLevel(assignmentDetails.getDifficultyLevel());
                    // The assignmentDetails already has questions as a Set<Question> so this is fine
                    assignment.setQuestions(assignmentDetails.getQuestions());
                    return assignmentRepository.save(assignment);
                })
                .orElseThrow(() -> new EntityNotFoundException("Assignment not found with id: " + id));
    }

    @Override
    public void deleteAssignment(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Assignment not found with id: " + id));
        assignmentRepository.delete(assignment);
    }

    @Override
    public List<Assignment> generateAssignmentsForTopic(Long topicId) {
        // This is a placeholder for AI-powered assignment generation
        // The actual implementation would use OpenAI's API to generate questions
        // based on the topic content
        
        return topicRepository.findById(topicId)
                .map(topic -> {
                    List<Assignment> assignments = new ArrayList<>();
                    
                    // Generate assignments for each difficulty level
                    for (Assignment.DifficultyLevel level : Assignment.DifficultyLevel.values()) {
                        Assignment assignment = new Assignment();
                        assignment.setTitle("Auto-generated " + level + " assignment for " + topic.getTitle());
                        assignment.setContent("This is an auto-generated assignment to test your knowledge of " + topic.getTitle());
                        assignment.setDifficultyLevel(level);
                        assignment.setTopic(topic);
                        assignment.setCreatedAt(LocalDateTime.now());
                        
                        // Generate sample questions
                        Set<Question> questions = generateQuestionsForTopic(topic, level, 5);
                        assignment.setQuestions(questions);
                        
                        assignments.add(assignmentRepository.save(assignment));
                    }
                    
                    return assignments;
                })
                .orElseThrow(() -> new EntityNotFoundException("Topic not found with id: " + topicId));
    }

    private Set<Question> generateQuestionsForTopic(com.studyforge.model.Topic topic, Assignment.DifficultyLevel level, int count) {
        // This is a placeholder implementation
        // The actual implementation would use OpenAI's API to generate questions
        
        Set<Question> questions = new HashSet<>();
        
        for (int i = 0; i < count; i++) {
            Question question = new Question();
            question.setText("Sample question " + (i + 1) + " for " + topic.getTitle() + " (" + level + ")");
            question.setType(Question.QuestionType.MULTIPLE_CHOICE);
            question.setCreatedAt(LocalDateTime.now());
            question.setUpdatedAt(LocalDateTime.now());
            
            // Generate options
            Set<QuestionOption> options = new HashSet<>();
            for (int j = 0; j < 4; j++) {
                QuestionOption option = new QuestionOption();
                option.setText("Option " + (j + 1));
                option.setIsCorrect(j == 0); // First option is correct
                option.setQuestion(question);
                options.add(option);
            }
            
            question.setOptions(options);
            questions.add(question);
        }
        
        return questions;
    }

    @Override
    public void evaluateAssignment(Long id, List<Long> questionIds, List<String> userAnswers) {
        // This method would evaluate user answers against correct answers
        // and update the assignment score
        
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Assignment not found with id: " + id));
        
        // This is a placeholder implementation
        // In a real implementation, we would compare user answers with correct answers
        // and calculate a score
        
        // For now, we'll just update the completion status
        assignment.setIsCompleted(true);
        assignment.setUpdatedAt(LocalDateTime.now());
        assignmentRepository.save(assignment);
    }
}
