package com.studyforge.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyforge.dto.TopicGenerationResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenAIService {
    private static final Logger logger = LoggerFactory.getLogger(OpenAIService.class);

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.model:gpt-4}")
    private String model;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public OpenAIService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Process the syllabus document text and generate structured topics
     *
     * @param documentText The text extracted from the syllabus document
     * @return TopicGenerationResponse containing the structured topics
     */
    public TopicGenerationResponse generateTopicsFromSyllabus(String documentText) {
        String systemPrompt = createSystemPrompt();
        String userPrompt = documentText;
        
        logger.info("Generating topics for document of length: {} characters", documentText.length());

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            
            List<Map<String, String>> messages = new ArrayList<>();
            
            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", systemPrompt);
            messages.add(systemMessage);

            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", userPrompt);
            messages.add(userMessage);

            requestBody.put("messages", messages);
            
            // Ensure we get structured JSON output
            requestBody.put("response_format", Map.of("type", "json_object"));
            
            // Set temperature for more deterministic output
            requestBody.put("temperature", 0.2);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://api.openai.com/v1/chat/completions",
                request,
                Map.class
            );

            Map<String, Object> responseBody = response.getBody();
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
            Map<String, Object> choice = choices.get(0);
            Map<String, Object> message = (Map<String, Object>) choice.get("message");
            
            String content = (String) message.get("content");
            logger.debug("OpenAI API response: {}", content);
            
            // Parse the JSON response into our DTO
            TopicGenerationResponse topicResponse = objectMapper.readValue(content, TopicGenerationResponse.class);
            logger.info("Successfully parsed {} topics from OpenAI response", 
                topicResponse.getTopics() != null ? topicResponse.getTopics().size() : 0);
                
            return topicResponse;
            
        } catch (JsonProcessingException e) {
            logger.error("Failed to parse OpenAI API response", e);
            return new TopicGenerationResponse(); // Return empty response on error
        } catch (Exception e) {
            logger.error("Error calling OpenAI API", e);
            return new TopicGenerationResponse(); // Return empty response on error
        }
    }

    /**
     * Creates a detailed system prompt for OpenAI to structure syllabus content into topics
     */
    private String createSystemPrompt() {
        return """
        You are SyllabusAI, an expert educational content analyzer designed to process academic syllabi and course documents. 
        Your task is to analyze the provided syllabus document and break it down into logical, sequential topics for a learning management system.
        
        # TASK DESCRIPTION
        Analyze the syllabus text and extract or create a structured set of learning topics that cover the entire curriculum.
        
        # OUTPUT FORMAT
        You must provide your response in valid JSON format with the following structure:
        {
          "topics": [
            {
              "title": "Topic name - clear and descriptive",
              "content": "Detailed content or description of what this topic covers",
              "estimatedDurationMinutes": Integer value representing estimated time to complete (30-180),
              "orderIndex": Sequential number starting from 0,
              "keyTerms": ["term1", "term2", "term3"],
              "learningObjectives": ["objective1", "objective2"]
            }
          ]
        }
        
        # GUIDELINES
        1. ORGANIZATION: Create 5-15 topics that logically organize the syllabus content
        2. COMPREHENSIVENESS: Ensure all major concepts from the syllabus are covered
        3. SEQUENCING: Arrange topics in a logical learning sequence, starting with fundamentals
        4. NAMING: Give each topic a clear, descriptive title that accurately represents its content
        5. BALANCE: Create topics of roughly similar scope and learning time
        6. TIME ESTIMATION: Provide realistic estimates for how long each topic might take to master
        7. LEARNING OBJECTIVES: Extract or create clear learning objectives for each topic
        8. KEY TERMS: Identify important terminology associated with each topic
        
        # ADDITIONAL CONSIDERATIONS
        - If the syllabus is from a specific field (computer science, medicine, literature, etc.), apply domain-specific best practices
        - If the syllabus already has explicit sections/topics, you may use them as a foundation but improve as needed
        - If the syllabus is disorganized or lacks structure, create a logical structure based on the content
        - Avoid topics that are too broad or too narrow
        
        Remember, your analysis will be used by students to plan their learning journey, so clarity, accuracy, and educational value are paramount.
        """;
    }
}
