import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  LinearProgress,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Timer as TimerIcon,
  CheckCircle as TaskIcon,
  Favorite as HabitIcon,
} from '@mui/icons-material';
import axios from 'axios';

const Progress = () => {
  const [timeframe, setTimeframe] = useState('weekly');
  const [stats, setStats] = useState({
    tasks: { total: 0, completed: 0, completion_rate: 0 },
    habits: { total: 0, active_streaks: 0, average_streak: 0 },
    pomodoro: { total_sessions: 0, total_minutes: 0, average_session_length: 0 },
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`/api/progress?timeframe=${timeframe}`);
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch progress stats:', error);
      }
    };
    fetchStats();
  }, [timeframe]);

  const StatCard = ({ title, icon, stats, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {Object.entries(stats).map(([key, value]) => (
          <Box key={key} sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Typography>
            <Typography variant="h6" color={color}>
              {typeof value === 'number' && value % 1 !== 0 
                ? value.toFixed(2) 
                : value}
              {key.includes('minutes') ? ' mins' : ''}
              {key.includes('rate') ? '%' : ''}
            </Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Progress Analytics
        </Typography>
        <ToggleButtonGroup
          value={timeframe}
          exclusive
          onChange={(e, newValue) => newValue && setTimeframe(newValue)}
          sx={{ mb: 3 }}
        >
          <ToggleButton value="weekly">Weekly</ToggleButton>
          <ToggleButton value="monthly">Monthly</ToggleButton>
          <ToggleButton value="all-time">All Time</ToggleButton>
        </ToggleButtonGroup>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Tasks"
              icon={<TaskIcon sx={{ color: '#2196f3' }} />}
              stats={{
                'Total Tasks': stats.tasks.total,
                'Completed': stats.tasks.completed,
                'Completion Rate': stats.tasks.completion_rate * 100,
              }}
              color="#2196f3"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Habits"
              icon={<HabitIcon sx={{ color: '#4caf50' }} />}
              stats={{
                'Total Habits': stats.habits.total,
                'Active Streaks': stats.habits.active_streaks,
                'Average Streak': stats.habits.average_streak,
              }}
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Pomodoro Sessions"
              icon={<TimerIcon sx={{ color: '#f44336' }} />}
              stats={{
                'Total Sessions': stats.pomodoro.total_sessions,
                'Total Minutes': stats.pomodoro.total_minutes,
                'Avg Session Length': stats.pomodoro.average_session_length,
              }}
              color="#f44336"
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Progress;
