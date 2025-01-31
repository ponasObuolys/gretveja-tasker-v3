# Task Management Application

A collaborative task management application built with React, TypeScript, and Node.js.

## Features

- User authentication
- Create and manage boards
- Create lists within boards
- Add, edit, and delete cards
- Drag and drop functionality
- Card assignments
- Due dates and priorities
- Real-time updates

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies for both frontend and backend:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

3. Set up the database:
- Create a PostgreSQL database
- Copy `.env.example` to `.env` in the server directory
- Update the database connection details in `.env`

4. Start the development servers:

In the server directory:
```bash
# Start the backend server
npm run dev
```

In the root directory:
```bash
# Start the frontend development server
npm run dev
```

5. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Environment Variables

### Backend (.env)
```
PORT=5000
PGUSER=postgres
PGHOST=localhost
PGPASSWORD=your_password
PGDATABASE=tasker_db
PGPORT=5432
JWT_SECRET=your_jwt_secret_key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## API Documentation

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user

### Boards
- GET /api/boards - Get all boards
- GET /api/boards/:id - Get single board
- POST /api/boards - Create board
- PUT /api/boards/:id - Update board
- DELETE /api/boards/:id - Delete board

### Lists
- GET /api/lists/board/:boardId - Get all lists for a board
- POST /api/lists - Create list
- PUT /api/lists/:id - Update list
- DELETE /api/lists/:id - Delete list

### Cards
- GET /api/cards/list/:listId - Get all cards for a list
- POST /api/cards - Create card
- PUT /api/cards/:id - Update card
- DELETE /api/cards/:id - Delete card
- POST /api/cards/:id/assign - Assign user to card
- DELETE /api/cards/:id/assign/:userId - Remove user from card

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 