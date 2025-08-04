package com.studyforge.controller;

import com.studyforge.dto.ProgressDto;
import com.studyforge.dto.TopicDto;
import com.studyforge.dto.TopicRequest;
import com.studyforge.model.Topic;
import com.studyforge.model.Progress;
import com.studyforge.service.TopicService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/topics")
public class TopicController {

    private final TopicService topicService;

    public TopicController(TopicService topicService) {
        this.topicService = topicService;
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<TopicDto> createTopic(@Valid @RequestBody TopicRequest topicRequest) {
        Topic topic = new Topic();
        topic.setTitle(topicRequest.getTitle());
        // Since Topic doesn't have description field, we'll merge it into content if provided
        String fullContent = topicRequest.getDescription() != null ? 
            topicRequest.getDescription() + "\n\n" + (topicRequest.getContent() != null ? topicRequest.getContent() : "") :
            topicRequest.getContent();
        topic.setContent(fullContent);
        
        topic.setDeadline(topicRequest.getDeadline());
        topic.setEstimatedDurationMinutes(topicRequest.getEstimatedDurationMinutes());
        topic.setOrderIndex(topicRequest.getOrderIndex());
        
        Topic newTopic = topicService.createTopic(topic, topicRequest.getSyllabusId());
        return ResponseEntity.ok(new TopicDto(newTopic));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<TopicDto> getTopic(@PathVariable Long id) {
        Topic topic = topicService.getTopic(id);
        return ResponseEntity.ok(new TopicDto(topic));
    }

    @GetMapping("/syllabus/{syllabusId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<TopicDto>> getAllTopicsBySyllabus(@PathVariable Long syllabusId) {
        List<Topic> topics = topicService.getAllTopicsBySyllabusId(syllabusId);
        List<TopicDto> topicDtos = topics.stream()
            .map(TopicDto::new)
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(topicDtos);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<TopicDto> updateTopic(@PathVariable Long id, @RequestBody Topic topicDetails) {
        Topic updatedTopic = topicService.updateTopic(id, topicDetails);
        return ResponseEntity.ok(new TopicDto(updatedTopic));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id) {
        topicService.deleteTopic(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{topicId}/progress")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ProgressDto> trackProgress(
            @PathVariable Long topicId,
            @RequestParam Integer completionPercentage) {
        Progress progress = topicService.trackProgress(topicId, completionPercentage);
        return ResponseEntity.ok(new ProgressDto(progress));
    }
}
