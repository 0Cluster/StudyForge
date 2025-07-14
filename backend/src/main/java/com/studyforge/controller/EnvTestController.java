package com.studyforge.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/env-test")
public class EnvTestController {
    
    @Value("${spring.datasource.url}")
    private String dbUrl;
    
    @Value("${spring.datasource.username}")
    private String dbUsername;
    
    @Value("${openai.api.key}")
    private String openaiApiKey;
    
    @GetMapping
    public Map<String, String> testEnvVariables() {
        Map<String, String> env = new HashMap<>();
        
        // Masking sensitive data for security
        env.put("Database URL", maskSensitiveData(dbUrl));
        env.put("Database Username", dbUsername);
        env.put("OpenAI API Key", maskSensitiveData(openaiApiKey));
        
        return env;
    }
    
    private String maskSensitiveData(String data) {
        if (data == null || data.length() < 8) {
            return "***masked***";
        }
        // Show only first 4 and last 4 characters
        return data.substring(0, 4) + "..." + data.substring(data.length() - 4);
    }
}
