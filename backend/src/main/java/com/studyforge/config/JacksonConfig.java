package com.studyforge.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.hibernate5.jakarta.Hibernate5JakartaModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;

@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        // Register Hibernate5Module to handle lazy loading
        Hibernate5JakartaModule hibernate5Module = new Hibernate5JakartaModule();
        // Configure Hibernate module to handle lazy-loaded objects
        hibernate5Module.disable(Hibernate5JakartaModule.Feature.FORCE_LAZY_LOADING);
        hibernate5Module.enable(Hibernate5JakartaModule.Feature.REPLACE_PERSISTENT_COLLECTIONS);
        mapper.registerModule(hibernate5Module);
        
        // Configure JavaTimeModule with custom serializers for LocalDateTime
        JavaTimeModule javaTimeModule = new JavaTimeModule();
        
        // Use ISO-8601 format for LocalDateTime (yyyy-MM-dd'T'HH:mm:ss)
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ISO_DATE_TIME;
        javaTimeModule.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(dateTimeFormatter));
        
        // Register the customized JavaTimeModule
        mapper.registerModule(javaTimeModule);
        
        // Don't fail on empty beans
        mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        
        // Use ISO format for dates instead of timestamps (important!)
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        return mapper;
    }

    @Bean
    public MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter(ObjectMapper objectMapper) {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(objectMapper);
        return converter;
    }
}
