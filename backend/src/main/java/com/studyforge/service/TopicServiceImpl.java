package com.studyforge.service;

import com.studyforge.model.Progress;
import com.studyforge.model.Topic;
import com.studyforge.repository.ProgressRepository;
import com.studyforge.repository.SyllabusRepository;
import com.studyforge.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.EntityNotFoundException;

@Service
public class TopicServiceImpl implements TopicService {

    private final TopicRepository topicRepository;
    private final SyllabusRepository syllabusRepository;
    private final ProgressRepository progressRepository;

    @Autowired
    public TopicServiceImpl(TopicRepository topicRepository, SyllabusRepository syllabusRepository, ProgressRepository progressRepository) {
        this.topicRepository = topicRepository;
        this.syllabusRepository = syllabusRepository;
        this.progressRepository = progressRepository;
    }

    @Override
    public Topic createTopic(Topic topic, Long syllabusId) {
        return syllabusRepository.findById(syllabusId)
                .map(syllabus -> {
                    topic.setSyllabus(syllabus);
                    Topic savedTopic = topicRepository.save(topic);
                    
                    // Initialize progress for this topic
                    Progress progress = new Progress();
                    progress.setTopic(savedTopic);
                    progress.setCompletionPercentage(0);
                    progress.setStartedAt(LocalDateTime.now());
                    progress.setCreatedAt(LocalDateTime.now());
                    progress.setUpdatedAt(LocalDateTime.now());
                    progressRepository.save(progress);
                    
                    return savedTopic;
                })
                .orElseThrow(() -> new EntityNotFoundException("Syllabus not found with id: " + syllabusId));
    }

    @Override
    public Topic getTopic(Long id) {
        return topicRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Topic not found with id: " + id));
    }

    @Override
    public List<Topic> getAllTopicsBySyllabusId(Long syllabusId) {
        return topicRepository.findBySyllabusIdOrderByOrderIndexAsc(syllabusId);
    }

    @Override
    public Topic updateTopic(Long id, Topic topicDetails) {
        return topicRepository.findById(id)
                .map(topic -> {
                    topic.setTitle(topicDetails.getTitle());
                    topic.setContent(topicDetails.getContent());
                    topic.setDeadline(topicDetails.getDeadline());
                    topic.setEstimatedDurationMinutes(topicDetails.getEstimatedDurationMinutes());
                    topic.setOrderIndex(topicDetails.getOrderIndex());
                    return topicRepository.save(topic);
                })
                .orElseThrow(() -> new EntityNotFoundException("Topic not found with id: " + id));
    }

    @Override
    public void deleteTopic(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Topic not found with id: " + id));
        topicRepository.delete(topic);
    }

    @Override
    public Progress trackProgress(Long topicId, Integer completionPercentage) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new EntityNotFoundException("Topic not found with id: " + topicId));
        
        Progress progress = progressRepository.findByTopicId(topicId)
                .orElseGet(() -> {
                    Progress newProgress = new Progress();
                    newProgress.setTopic(topic);
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
}
