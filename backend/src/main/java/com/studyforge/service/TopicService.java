package com.studyforge.service;

import com.studyforge.model.Topic;
import com.studyforge.model.Progress;

import java.util.List;

public interface TopicService {
    Topic createTopic(Topic topic, Long syllabusId);
    Topic getTopic(Long id);
    List<Topic> getAllTopicsBySyllabusId(Long syllabusId);
    Topic updateTopic(Long id, Topic topicDetails);
    void deleteTopic(Long id);
    Progress trackProgress(Long topicId, Integer completionPercentage);
}
