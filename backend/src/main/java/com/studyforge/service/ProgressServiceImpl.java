package com.studyforge.service;

import com.studyforge.model.Progress;
import com.studyforge.model.Topic;
import com.studyforge.repository.ProgressRepository;
import com.studyforge.repository.TopicRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.EntityNotFoundException;

@Service
public class ProgressServiceImpl implements ProgressService {

    private final ProgressRepository progressRepository;
    private final TopicRepository topicRepository;

    public ProgressServiceImpl(ProgressRepository progressRepository, TopicRepository topicRepository) {
        this.progressRepository = progressRepository;
        this.topicRepository = topicRepository;
    }

    @Override
    public Progress getProgressByTopicId(Long topicId) {
        return progressRepository.findByTopicId(topicId)
                .orElseThrow(() -> new EntityNotFoundException("Progress not found for topic id: " + topicId));
    }

    @Override
    public List<Progress> getAllProgressBySyllabusId(Long syllabusId) {
        return progressRepository.findByTopic_SyllabusId(syllabusId);
    }

    @Override
    public Progress updateProgress(Long topicId, Integer completionPercentage) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new EntityNotFoundException("Topic not found with id: " + topicId));
        
        Progress progress = progressRepository.findByTopicId(topicId)
                .orElseGet(() -> {
                    Progress newProgress = new Progress();
                    newProgress.setTopic(topic);
                    newProgress.setStartedAt(LocalDateTime.now());
                    newProgress.setCreatedAt(LocalDateTime.now());
                    return newProgress;
                });
        
        progress.setCompletionPercentage(completionPercentage);
        progress.setUpdatedAt(LocalDateTime.now());
        
        // If progress is 100%, mark it as completed
        if (completionPercentage != null && completionPercentage == 100) {
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
        }
        
        return progressRepository.save(progress);
    }

    @Override
    public void deleteProgress(Long id) {
        Progress progress = progressRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Progress not found with id: " + id));
        progressRepository.delete(progress);
    }
}
