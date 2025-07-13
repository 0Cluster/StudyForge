# StudyForge Architecture

This document describes the architecture of the StudyForge application.

## System Overview

StudyForge is a web application with a Next.js frontend and Spring Boot backend. It uses PostgreSQL for data storage and integrates with OpenAI for document analysis and assessment generation.

## Architecture Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│             │         │             │         │             │
│  Next.js    │ ◄─────► │ Spring Boot │ ◄─────► │ PostgreSQL  │
│  Frontend   │   REST  │ Backend     │   JPA   │ Database    │
│             │   API   │             │         │             │
└─────────────┘         └──────┬──────┘         └─────────────┘
                               │
                               │ API
                               ▼
                        ┌─────────────┐
                        │             │
                        │  OpenAI     │
                        │  API        │
                        │             │
                        └─────────────┘
```

## Component Breakdown

### Frontend (Next.js)

- **Pages**: Main application views
- **Components**: Reusable UI components
- **Services**: API clients for backend communication
- **Context**: Global state management
- **Hooks**: Custom React hooks for shared logic
- **Utils**: Helper functions and utilities

### Backend (Spring Boot)

- **Controllers**: REST API endpoints
- **Services**: Business logic layer
- **Repositories**: Data access layer
- **Models**: Entity definitions
- **Security**: Authentication and authorization
- **Config**: Application configuration

### Database (PostgreSQL)

The database schema consists of the following main entities:

- **Users**: Application users
- **Roles**: User roles for authorization
- **Syllabi**: Uploaded syllabi documents
- **Topics**: Syllabus sections/topics
- **Progress**: User progress tracking
- **Assignments**: Generated assessments
- **Questions**: Assessment questions
- **QuestionOptions**: Multiple choice options

## Authentication Flow

1. User signs up or logs in
2. Backend validates credentials
3. JWT token issued to user
4. Frontend stores token in localStorage
5. Token sent with each API request

## Document Processing Flow

1. User uploads document
2. Backend extracts text
3. Text sent to OpenAI API
4. AI analyzes and chunks content
5. Chunks saved as Topics
6. Topics presented to user with durations and deadlines

## Assessment Flow

1. User requests assessment for a Topic
2. Backend sends Topic content to OpenAI
3. AI generates questions of specified difficulty
4. Questions saved to database
5. Frontend displays assessment to user
6. User submits answers
7. Backend evaluates responses
8. Results displayed and progress updated

## Technologies

- **Frontend**: Next.js, React, TypeScript, Material UI, TailwindCSS
- **Backend**: Java 17, Spring Boot, Spring Security, JPA
- **Database**: PostgreSQL
- **API**: RESTful API with JWT authentication
- **AI**: OpenAI API (GPT-4)
- **Document Processing**: Apache PDFBox, Apache POI
