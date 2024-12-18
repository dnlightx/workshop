import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PomodoroTimer from './pages/PomodoroTimer';
import TodoList from './pages/TodoList';
import HabitTracker from './pages/HabitTracker';
import Progress from './pages/Progress';
import Store from './pages/Store';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

// Components
import Navigation from './components/Navigation';
import { useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navigation />}
      <Box sx={{ p: 3 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={<PrivateRoute><Dashboard /></PrivateRoute>}
          />
          <Route
            path="/pomodoro"
            element={<PrivateRoute><PomodoroTimer /></PrivateRoute>}
          />
          <Route
            path="/tasks"
            element={<PrivateRoute><TodoList /></PrivateRoute>}
          />
          <Route
            path="/habits"
            element={<PrivateRoute><HabitTracker /></PrivateRoute>}
          />
          <Route
            path="/progress"
            element={<PrivateRoute><Progress /></PrivateRoute>}
          />
          <Route
            path="/store"
            element={<PrivateRoute><Store /></PrivateRoute>}
          />
          <Route
            path="/leaderboard"
            element={<PrivateRoute><Leaderboard /></PrivateRoute>}
          />
          <Route
            path="/profile"
            element={<PrivateRoute><Profile /></PrivateRoute>}
          />
        </Routes>
      </Box>
    </>
  );
}

export default App;
