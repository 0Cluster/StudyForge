# StudyForge Setup Guide

This document explains how to set up and run the StudyForge application.

## Prerequisites

- Node.js 18+ for the frontend
- JDK 17+ for the backend
- PostgreSQL 13+ for the database
- Maven for backend dependency management
- Git for version control

## Backend Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd StudyForge
   ```

2. **Configure PostgreSQL**:
   - Create a new database named `studyforge`:
   ```sql
   CREATE DATABASE studyforge;
   ```
   - Make sure PostgreSQL is running on port 5432

3. **Configure application properties**:
   - Update the database connection details in `backend/src/main/resources/application.properties` if necessary
   - Add your OpenAI API key to the configuration

4. **Build and run the backend**:
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```
   
   The backend server will start on port 8080.

## Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment variables**:
   - Create a `.env.local` file in the frontend directory:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   
   The frontend will be available at http://localhost:3000.

## Initial Data Setup

When running for the first time, the backend will automatically create the required database tables.

You'll need to add initial user roles for proper authentication:

```sql
INSERT INTO roles (name) VALUES ('ROLE_USER');
INSERT INTO roles (name) VALUES ('ROLE_ADMIN');
```

## OpenAI API Configuration

StudyForge uses the OpenAI API for document analysis and assessment generation. To properly configure this:

1. Obtain an API key from [OpenAI](https://openai.com/)
2. Add the key to your application.properties file:
   ```
   openai.api.key=your-openai-api-key
   openai.model=gpt-4
   ```

## Testing the Application

1. Register a new account through the frontend signup page
2. Log in with your credentials
3. Navigate to the dashboard and upload a syllabus document
4. The system will process the document and display the generated study plan

## Production Deployment

For production deployment:

1. **Backend**:
   - Create a production profile in application.properties
   - Configure secure database credentials
   - Build an executable JAR:
     ```bash
     mvn clean package -Pprod
     ```
   - Run the JAR on your server:
     ```bash
     java -jar target/studyforge-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
     ```

2. **Frontend**:
   - Build the production version:
     ```bash
     npm run build
     ```
   - Deploy the contents of the `.next` directory to your web server
