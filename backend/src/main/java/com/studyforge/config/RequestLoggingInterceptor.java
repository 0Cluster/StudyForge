package com.studyforge.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Enumeration;

@Component
public class RequestLoggingInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        logger.info("==== REQUEST DEBUG INFO ====");
        logger.info("Request Method: {}", request.getMethod());
        logger.info("Request URL: {}", request.getRequestURL());
        logger.info("Context Path: {}", request.getContextPath());
        logger.info("Servlet Path: {}", request.getServletPath());
        logger.info("Path Info: {}", request.getPathInfo());
        logger.info("Request URI: {}", request.getRequestURI());
        
        // Log headers
        // logger.info("=== Request Headers ===");
        // Enumeration<String> headerNames = request.getHeaderNames();
        // while (headerNames.hasMoreElements()) {
        //     String headerName = headerNames.nextElement();
        //     logger.info("{}: {}", headerName, request.getHeader(headerName));
        // }
        logger.info("=========================");
        
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, 
                          Object handler, ModelAndView modelAndView) throws Exception {
        // No post-processing needed
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                               Object handler, Exception ex) throws Exception {
        // No after-completion processing needed
    }
}
