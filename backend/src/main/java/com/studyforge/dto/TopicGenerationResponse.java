package com.studyforge.dto;

import java.util.List;

public class TopicGenerationResponse {
    private List<TopicDto> topics;
    
    public TopicGenerationResponse() {
        // Default constructor
    }
    
    public List<TopicDto> getTopics() {
        return topics;
    }
    
    public void setTopics(List<TopicDto> topics) {
        this.topics = topics;
    }
}
