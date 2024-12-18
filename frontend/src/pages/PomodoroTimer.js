import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Stack,
  IconButton,
  List,
  ListItem,
  ListItemText,
  useTheme,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Settings,
} from '@mui/icons-material';
import axios from 'axios';

const PomodoroTimer = () => {
  const theme = useTheme();
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = async () => {
    try {
      const response = await axios.post('/api/pomodoro', {
        duration: Math.floor(time / 60)
      });
      setSessionId(response.data.id);
      setIsActive(true);
    } catch (error) {
      console.error('Failed to start pomodoro session:', error);
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const stopTimer = async () => {
    if (sessionId) {
      try {
        const response = await axios.post(`/api/pomodoro/${sessionId}/complete`);
        console.log('Earned coins:', response.data.coins_earned);
      } catch (error) {
        console.error('Failed to complete pomodoro session:', error);
      }
    }
    setIsActive(false);
    setTime(25 * 60);
    setSessionId(null);
  };

  const fetchSessions = useCallback(async () => {
    try {
      const response = await axios.get('/api/pomodoro');
      setSessions(response.data.sessions);
    } catch (error) {
      console.error('Failed to fetch pomodoro sessions:', error);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    let interval = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((time) => {
          if (time <= 1) {
            stopTimer();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, time]);

  const progress = ((25 * 60 - time) / (25 * 60)) * 100;

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Pomodoro Timer
        </Typography>
        
        <Box sx={{ position: 'relative', display: 'inline-flex', my: 4 }}>
          <CircularProgress
            variant="determinate"
            value={progress}
            size={200}
            thickness={2}
            sx={{
              color: theme.palette.primary.main,
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h3" component="div" color="text.secondary">
              {formatTime(time)}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={2} justifyContent="center" mb={4}>
          {!isActive ? (
            <IconButton
              color="primary"
              size="large"
              onClick={startTimer}
              disabled={sessionId !== null}
            >
              <PlayArrow />
            </IconButton>
          ) : (
            <IconButton color="primary" size="large" onClick={pauseTimer}>
              <Pause />
            </IconButton>
          )}
          <IconButton
            color="secondary"
            size="large"
            onClick={stopTimer}
            disabled={!sessionId}
          >
            <Stop />
          </IconButton>
          <IconButton color="primary" size="large">
            <Settings />
          </IconButton>
        </Stack>

        <Typography variant="h6" gutterBottom align="left">
          Recent Sessions
        </Typography>
        <List>
          {sessions.map((session) => (
            <ListItem key={session.id}>
              <ListItemText
                primary={`${session.duration} minutes`}
                secondary={`Started: ${new Date(session.start_time).toLocaleString()}`}
              />
              {session.completed && (
                <Typography variant="caption" color="success.main">
                  Completed
                </Typography>
              )}
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default PomodoroTimer;
