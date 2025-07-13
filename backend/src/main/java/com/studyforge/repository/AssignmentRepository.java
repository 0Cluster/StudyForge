package com.studyforge.repository;

import com.studyforge.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByTopicId(Long topicId);
    List<Assignment> findByTopicIdAndDifficultyLevel(Long topicId, Assignment.DifficultyLevel difficultyLevel);
}
