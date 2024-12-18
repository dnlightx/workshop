import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Timer as TimerIcon,
  CheckCircle as TaskIcon,
  Favorite as HabitIcon,
  TrendingUp as ProgressIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      title: 'Pomodoro Timer',
      description: 'Stay focused and earn rewards',
      icon: <TimerIcon fontSize="large" />,
      path: '/pomodoro',
      color: '#f44336',
    },
    {
      title: 'Task Manager',
      description: 'Organize and complete tasks',
      icon: <TaskIcon fontSize="large" />,
      path: '/tasks',
      color: '#2196f3',
    },
    {
      title: 'Habit Tracker',
      description: 'Build and maintain habits',
      icon: <HabitIcon fontSize="large" />,
      path: '/habits',
      color: '#4caf50',
    },
    {
      title: 'Progress Analytics',
      description: 'Track your productivity',
      icon: <ProgressIcon fontSize="large" />,
      path: '/progress',
      color: '#ff9800',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.username}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        You have {user?.coins} coins
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {features.map((feature) => (
          <Grid item xs={12} sm={6} md={3} key={feature.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  transition: 'transform 0.2s',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                    color: feature.color,
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  {feature.title}
                </Typography>
                <Typography align="center" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  onClick={() => navigate(feature.path)}
                  sx={{ color: feature.color }}
                >
                  Open
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Tasks
            </Typography>
            {/* Add recent tasks list here */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Habit Streaks
            </Typography>
            {/* Add habit streaks here */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
