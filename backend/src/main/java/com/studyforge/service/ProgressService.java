package com.studyforge.service;

import com.studyforge.model.Progress;
import java.util.List;

public interface ProgressService {
    Progress getProgressByTopicId(Long topicId);
    List<Progress> getAllProgressBySyllabusId(Long syllabusId);
    Progress updateProgress(Long topicId, Integer completionPercentage);
    void deleteProgress(Long id);
}
