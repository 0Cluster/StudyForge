package com.studyforge.repository;

import com.studyforge.model.Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, Long> {
    Optional<Progress> findByTopicId(Long topicId);
    List<Progress> findByTopic_SyllabusId(Long syllabusId);
}
