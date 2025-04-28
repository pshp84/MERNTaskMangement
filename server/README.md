# MERN Assignment Server

## Task Management System - Server

This is the backend server for the Task Management System, built with Node.js, Express, PostgreSQL, and Kafka.

## Features

- User Authentication (JWT)
- Task Management (CRUD operations)
- Real-time notifications using Kafka and WebSocket
- API Documentation with Swagger
- Database migrations with Drizzle ORM

## Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose
- PostgreSQL
- Apache Kafka

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the values in `.env` according to your setup.

3. Start the required services using Docker:
   ```bash
   docker-compose up -d
   ```

4. Run database migrations:
   ```bash
   npx drizzle-kit push:pg
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

Once the server is running, you can access the Swagger API documentation at:
```
http://localhost:8000/api-docs
```
- `GET /api/hello` — Health check endpoint

---

Add your API endpoints and business logic in `index.js` or split into routes/controllers as needed.
