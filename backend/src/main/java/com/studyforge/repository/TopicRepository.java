package com.studyforge.repository;

import com.studyforge.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findBySyllabusId(Long syllabusId);
    List<Topic> findBySyllabusIdOrderByOrderIndexAsc(Long syllabusId);
}
