package com.studyforge.service;

import com.studyforge.model.Syllabus;
import com.studyforge.model.Topic;
import com.studyforge.repository.SyllabusRepository;
import com.studyforge.repository.TopicRepository;
import com.studyforge.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;

@Service
public class SyllabusServiceImpl implements SyllabusService {

    @Value("${openai.api.key}")
    private String openaiApiKey;

    private final SyllabusRepository syllabusRepository;
    private final UserRepository userRepository;
    private final TopicRepository topicRepository;

    @Autowired
    public SyllabusServiceImpl(SyllabusRepository syllabusRepository, UserRepository userRepository, TopicRepository topicRepository) {
        this.syllabusRepository = syllabusRepository;
        this.userRepository = userRepository;
        this.topicRepository = topicRepository;
    }

    @Override
    public Syllabus createSyllabus(Syllabus syllabus, Long userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    syllabus.setUser(user);
                    return syllabusRepository.save(syllabus);
                })
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    @Override
    public Syllabus getSyllabus(Long id) {
        return syllabusRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Syllabus not found with id: " + id));
    }

    @Override
    public List<Syllabus> getAllSyllabiByUserId(Long userId) {
        return syllabusRepository.findByUserId(userId);
    }

    @Override
    public Syllabus updateSyllabus(Long id, Syllabus syllabusDetails) {
        return syllabusRepository.findById(id)
                .map(syllabus -> {
                    syllabus.setTitle(syllabusDetails.getTitle());
                    syllabus.setDescription(syllabusDetails.getDescription());
                    syllabus.setStartDate(syllabusDetails.getStartDate());
                    syllabus.setEndDate(syllabusDetails.getEndDate());
                    return syllabusRepository.save(syllabus);
                })
                .orElseThrow(() -> new RuntimeException("Syllabus not found with id: " + id));
    }

    @Override
    public void deleteSyllabus(Long id) {
        syllabusRepository.deleteById(id);
    }

    @Override
    public Syllabus processDocument(MultipartFile file, String title, String description, Long userId) {
        try {
            String contentType = file.getContentType();
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get("uploads");
            
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            Syllabus.DocumentType documentType = determineDocumentType(contentType);
            String extractedText = extractTextFromDocument(file, documentType);
            
            Syllabus syllabus = new Syllabus();
            syllabus.setTitle(title);
            syllabus.setDescription(description);
            syllabus.setDocumentType(documentType);
            syllabus.setOriginalDocumentUrl(filePath.toString());
            
            return createSyllabus(syllabus, userId);
        } catch (IOException e) {
            throw new RuntimeException("Failed to process document: " + e.getMessage());
        }
    }

    @Override
    public List<Topic> generateTopicsFromSyllabus(Long syllabusId) {
        Syllabus syllabus = getSyllabus(syllabusId);
        
        try {
            String extractedText = "";
            
            if (syllabus.getOriginalDocumentUrl() != null) {
                Path filePath = Paths.get(syllabus.getOriginalDocumentUrl());
                
                if (Files.exists(filePath)) {
                    if (syllabus.getDocumentType() == Syllabus.DocumentType.PDF) {
                        try (PDDocument document = PDDocument.load(filePath.toFile())) {
                            PDFTextStripper pdfStripper = new PDFTextStripper();
                            extractedText = pdfStripper.getText(document);
                        }
                    } else if (syllabus.getDocumentType() == Syllabus.DocumentType.WORD) {
                        try (XWPFDocument document = new XWPFDocument(Files.newInputStream(filePath))) {
                            XWPFWordExtractor extractor = new XWPFWordExtractor(document);
                            extractedText = extractor.getText();
                        }
                    } else if (syllabus.getDocumentType() == Syllabus.DocumentType.TEXT) {
                        extractedText = new String(Files.readAllBytes(filePath));
                    }
                }
            }

            // This is a simplified implementation. In a real-world scenario, 
            // this would call an AI service to process the text and generate topics
            List<Topic> generatedTopics = generateTopicsWithAI(extractedText, syllabus);
            
            return generatedTopics;
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate topics: " + e.getMessage());
        }
    }
    
    private Syllabus.DocumentType determineDocumentType(String contentType) {
        if (contentType != null) {
            if (contentType.contains("pdf")) {
                return Syllabus.DocumentType.PDF;
            } else if (contentType.contains("word") || contentType.contains("docx") || contentType.contains("doc")) {
                return Syllabus.DocumentType.WORD;
            } else if (contentType.contains("text") || contentType.contains("plain")) {
                return Syllabus.DocumentType.TEXT;
            }
        }
        return Syllabus.DocumentType.OTHER;
    }
    
    private String extractTextFromDocument(MultipartFile file, Syllabus.DocumentType documentType) {
        try {
            if (documentType == Syllabus.DocumentType.PDF) {
                try (PDDocument document = PDDocument.load(file.getInputStream())) {
                    PDFTextStripper pdfStripper = new PDFTextStripper();
                    return pdfStripper.getText(document);
                }
            } else if (documentType == Syllabus.DocumentType.WORD) {
                try (XWPFDocument document = new XWPFDocument(file.getInputStream())) {
                    XWPFWordExtractor extractor = new XWPFWordExtractor(document);
                    return extractor.getText();
                }
            } else if (documentType == Syllabus.DocumentType.TEXT) {
                return new String(file.getBytes());
            }
            return "";
        } catch (IOException e) {
            throw new RuntimeException("Failed to extract text from document: " + e.getMessage());
        }
    }
    
    // Placeholder for AI-based topic generation
    // In a real application, this would integrate with OpenAI API or similar service
    private List<Topic> generateTopicsWithAI(String documentText, Syllabus syllabus) {
        // For demonstration purposes, we're creating simple dummy topics
        // In a real implementation, this would call OpenAI API to analyze and chunk the text
        List<Topic> topics = new ArrayList<>();
        
        // Simple approach: Split by paragraphs or sections
        String[] paragraphs = documentText.split("\n\n");
        
        int topicCount = Math.min(paragraphs.length, 10); // Limit to 10 topics for demonstration
        
        LocalDateTime startDate = LocalDateTime.now();
        
        for (int i = 0; i < topicCount; i++) {
            Topic topic = new Topic();
            topic.setTitle("Topic " + (i + 1));
            topic.setContent(paragraphs[i].length() > 2000 ? paragraphs[i].substring(0, 2000) : paragraphs[i]);
            topic.setEstimatedDurationMinutes(60); // Default 1 hour per topic
            topic.setDeadline(startDate.plusDays(i + 1)); // One day per topic
            topic.setOrderIndex(i);
            topic.setSyllabus(syllabus);
            
            topics.add(topicRepository.save(topic));
        }
        
        return topics;
    }
}
