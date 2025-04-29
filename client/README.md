# Task Management System - Client Application

A modern, real-time task management system built with Next.js 14, TypeScript, and ShadcnUI.

## Features

- Secure JWT Authentication
- Complete Task Management (Create, Read, Update, Delete)
- Real-time Notifications via WebSocket
- Responsive Dashboard with Advanced Filtering
- Modern UI with ShadcnUI Components
- Real-time Updates using Kafka

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **UI Components**: ShadcnUI
- **State Management**: React Query
- **Real-time**: WebSocket + Kafka Integration
- **Authentication**: JWT
- **Styling**: Tailwind CSS

## Prerequisites

Before running the application, ensure you have:

- Node.js 18.17 or later
- npm or yarn package manager
- Running instance of the backend server
- Kafka server running (for real-time features)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

## Running the Application

### Development Mode

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/         # Reusable UI components
├── hooks/               # Custom React hooks
├── jotai/             # State management
├── types/             # TypeScript type definitions
```

## Features Documentation

### Authentication
- Login/Register functionality
- JWT token management
- Protected routes

### Task Management
- Create new tasks with title, description, priority, etc.
- Update task status and details
- Delete tasks
- Assign tasks to users
- Set due dates and priorities

### Dashboard
- Task overview and statistics
- Filter tasks by status, priority, and due date
- Real-time updates for task changes

### Real-time Notifications
- WebSocket connection for instant updates
- Kafka integration for reliable message delivery
- Notification history and management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
