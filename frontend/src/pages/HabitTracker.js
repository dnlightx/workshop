import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Check as CheckIcon,
  Timer as TimerIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    target_days: 1,
    reminder_time: null,
  });
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await axios.get('/api/habits');
      setHabits(response.data.habits);
    } catch (error) {
      console.error('Failed to fetch habits:', error);
      showAlert('Failed to load habits', 'error');
    }
  };

  const handleCreateHabit = async () => {
    try {
      const habitData = {
        ...newHabit,
        reminder_time: newHabit.reminder_time ? 
          new Date(newHabit.reminder_time).toLocaleTimeString('en-US', { hour12: false }) : 
          null,
      };
      
      await axios.post('/api/habits', habitData);
      setOpenDialog(false);
      setNewHabit({ name: '', description: '', target_days: 1, reminder_time: null });
      fetchHabits();
      showAlert('Habit created successfully!', 'success');
    } catch (error) {
      console.error('Failed to create habit:', error);
      showAlert('Failed to create habit', 'error');
    }
  };

  const handleCompleteHabit = async (habitId) => {
    try {
      const response = await axios.post(`/api/habits/${habitId}/complete`);
      showAlert(`Habit completed! Earned ${response.data.coins_earned} coins`, 'success');
      fetchHabits();
    } catch (error) {
      if (error.response?.status === 400) {
        showAlert('Habit already completed today', 'warning');
      } else {
        showAlert('Failed to complete habit', 'error');
      }
    }
  };

  const showAlert = (message, severity) => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 3000);
  };

  const calculateProgress = (habit) => {
    return (habit.streak / habit.target_days) * 100;
  };

  return (
    <Box sx={{ p: 3 }}>
      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Habit Tracker</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Habit
        </Button>
      </Box>

      <Grid container spacing={3}>
        {habits.map((habit) => (
          <Grid item xs={12} sm={6} md={4} key={habit.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {habit.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {habit.description}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Progress: {Math.min(Math.round(calculateProgress(habit)), 100)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(calculateProgress(habit), 100)}
                    sx={{ mt: 1 }}
                  />
                </Box>

                <Typography variant="body2">
                  Current Streak: {habit.streak} days
                </Typography>
                {habit.reminder_time && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TimerIcon sx={{ mr: 1, fontSize: 'small' }} />
                    <Typography variant="body2">
                      Reminder: {habit.reminder_time}
                    </Typography>
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <Button
                  startIcon={<CheckIcon />}
                  onClick={() => handleCompleteHabit(habit.id)}
                  color="primary"
                >
                  Complete
                </Button>
                <IconButton color="error" size="small">
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Habit</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Habit Name"
            fullWidth
            value={newHabit.name}
            onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={newHabit.description}
            onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Target Days"
            type="number"
            fullWidth
            value={newHabit.target_days}
            onChange={(e) => setNewHabit({ ...newHabit, target_days: parseInt(e.target.value) })}
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <TimePicker
              label="Reminder Time"
              value={newHabit.reminder_time}
              onChange={(newValue) => setNewHabit({ ...newHabit, reminder_time: newValue })}
              renderInput={(params) => <TextField {...params} fullWidth margin="dense" />}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateHabit} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HabitTracker;
