package com.studyforge.repository;

import com.studyforge.model.Syllabus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface SyllabusRepository extends JpaRepository<Syllabus, Long> {
    List<Syllabus> findByUserId(Long userId);
    
    // Add a method with eager loading
    @Query("SELECT s FROM Syllabus s LEFT JOIN FETCH s.user LEFT JOIN FETCH s.topics WHERE s.id = :id")
    Optional<Syllabus> findByIdWithDetails(@Param("id") Long id);
}
