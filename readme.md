# Cricket Scoring Application

<img src="/screenshot/ss.jpg" alt="Screenshot 1" width="300"/> <img src="/screenshot/ss2.png" alt="Screenshot 2" width="300"/>

This Cricket Scoring Application is a full-stack web application designed to manage and display cricket match scores in real-time. It features a Next.js frontend with a user-friendly admin panel and a live scoreboard, backed by an Express.js server with MongoDB for data persistence.

## Features

- Real-time score updates
- Admin panel for ball-by-ball scoring
- Live scoreboard display
- Support for extras (wides, no-balls, byes, leg-byes, overthrows)
- Detailed statistics for batsmen and bowlers

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/cricket-scoring-app.git
   cd cricket-scoring-app
   ```

2. Install dependencies for both frontend and backend:
   ```
   cd frontend
   npm install
   cd ../backend
   npm install
   ```

3. Set up your MongoDB database and update the `.env` file in the backend directory with your MongoDB connection string:
   ```
   DATABASE_URL="your_mongodb_connection_string"
   ```

4. Run the database migrations:
   ```
   cd backend
   npx prisma db push
   ```

5. Seed the database with initial data:
   ```
   npm run seed
   ```

## Usage

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. In a new terminal, start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000` to access the application.

## How It Works
The application consists of several key components:

1. **Admin Panel** (`components/AdminPanel.tsx`):
   - Allows users to input ball-by-ball data
   - Manages the state of the current match, innings, and over
   - Sends scoring data to the backend API

2. **Scoreboard** (`components/Scoreboard.tsx`):
   - Displays the current match status, including team scores and individual player statistics
   - Updates in real-time as new data is entered through the Admin Panel

3. **Backend API** (`backend/src/routes/cricket.ts`):
   - Handles HTTP requests for fetching and updating match data
   - Implements the logic for updating player and team statistics

4. **Database** (MongoDB with Prisma ORM):
   - Stores all match-related data, including teams, players, innings, overs, and balls

The frontend communicates with the backend. When a user submits ball data through the Admin Panel, it's sent to the backend, which updates the database and returns the latest match state. The Scoreboard component then reflects these changes in real-time.
