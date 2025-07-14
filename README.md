# StudyForge

StudyForge is an intelligent learning platform that helps users organize their study materials, plan schedules, and track progress.

## Features

- **Document Processing**: Upload syllabus documents (PDF, Word, text)
- **AI-Powered Analysis**: Automatically divide syllabi into logical topics/chunks
- **Smart Scheduling**: AI assigns duration and deadlines to each topic
- **Progress Tracking**: Monitor your learning journey
- **Assessment Generation**: AI creates tests and assignments based on topics
- **Difficulty Levels**: Assignments categorized as Easy, Medium, Hard, and God-level

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Backend**: Java Spring Boot
- **Database**: PostgreSQL
- **AI Integration**: OpenAI API for document analysis and test generation
- **Document Processing**: Apache PDFBox, Apache POI

## Project Structure

- `/frontend`: Next.js application
- `/backend`: Spring Boot application
- `/docs`: Documentation and design resources

## Getting Started

### Prerequisites

- Node.js 18+ for frontend
- JDK 17+ for backend
- PostgreSQL database
- Maven for backend dependency management

### Installation

#### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Set up environment variables (optional, default values are provided):
   ```
   # For Windows
   set SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/studyforge
   set SPRING_DATASOURCE_USERNAME=postgres
   set SPRING_DATASOURCE_PASSWORD=postgres
   set JWT_SECRET=yourJwtSecretKey
   set OPENAI_API_KEY=your-openai-api-key

   # For Linux/Mac
   export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/studyforge
   export SPRING_DATASOURCE_USERNAME=postgres
   export SPRING_DATASOURCE_PASSWORD=postgres
   export JWT_SECRET=yourJwtSecretKey
   export OPENAI_API_KEY=your-openai-api-key
   ```

3. Run the application using Maven:
   ```
   mvnw spring-boot:run
   ```

#### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   ```

4. Run the development server:
   ```
   npm run dev
   ```

#### Database Setup

1. Install PostgreSQL if not already installed.
2. Create a database named `studyforge`:
   ```sql
   CREATE DATABASE studyforge;
   ```
3. The application will automatically create the tables on first run.

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration

### Users
- `GET /api/users/me` - Get current user
- `GET /api/users/{id}` - Get user by ID

### Syllabus
- `POST /syllabi` - Create a new syllabus
- `GET /syllabi/{id}` - Get syllabus by ID
- `GET /syllabi/user/{userId}` - Get all syllabi by user
- `PUT /syllabi/{id}` - Update a syllabus
- `DELETE /syllabi/{id}` - Delete a syllabus
- `POST /syllabi/upload` - Upload and process a syllabus document
- `POST /syllabi/{syllabusId}/generate-topics` - Generate topics from syllabus

### Topics
- `POST /topics` - Create a new topic
- `GET /topics/{id}` - Get topic by ID
- `GET /topics/syllabus/{syllabusId}` - Get all topics by syllabus
- `PUT /topics/{id}` - Update a topic
- `DELETE /topics/{id}` - Delete a topic
- `POST /topics/{topicId}/progress` - Track progress on a topic

### Progress
- `GET /progress/topic/{topicId}` - Get progress by topic ID
- `GET /progress/syllabus/{syllabusId}` - Get all progress by syllabus ID
- `PUT /progress/topic/{topicId}` - Update progress on a topic
- `DELETE /progress/{id}` - Delete progress

### Assignments
- `POST /assignments` - Create a new assignment
- `GET /assignments/{id}` - Get assignment by ID
- `GET /assignments/topic/{topicId}` - Get all assignments by topic
- `PUT /assignments/{id}` - Update an assignment
- `DELETE /assignments/{id}` - Delete an assignment
- `POST /assignments/{topicId}/generate-assignments` - Generate assignments for a topic
- `POST /assignments/submit` - Submit and evaluate an assignment

## Contribution

Feel free to open issues or submit pull requests.
