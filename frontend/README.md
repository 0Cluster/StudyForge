# StudyForge Frontend

This is the frontend application for StudyForge, built with Next.js.

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Create a `.env.local` file in the root directory with the following environment variables:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/components` - Reusable React components
- `/pages` - Next.js pages
- `/services` - API services
- `/styles` - Global styles
- `/types` - TypeScript type definitions
- `/utils` - Utility functions
- `/hooks` - Custom React hooks
- `/context` - React context providers
- `/public` - Static assets

## Features

- Upload and process syllabi documents (PDF, Word, text)
- View AI-generated topic breakdowns
- Track progress on individual topics
- Take assessments of varying difficulty levels
- View performance analytics
