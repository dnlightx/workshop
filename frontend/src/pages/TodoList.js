import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import axios from 'axios';

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    due_date: null,
    coins_reward: 10,
  });
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
  const [filter, setFilter] = useState('all'); // all, active, completed

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      showAlert('Failed to load tasks', 'error');
    }
  };

  const handleCreateTask = async () => {
    try {
      const response = await axios.post('/api/tasks', newTask);
      setTasks([...tasks, response.data]);
      setOpenDialog(false);
      resetNewTask();
      showAlert('Task created successfully!', 'success');
    } catch (error) {
      console.error('Failed to create task:', error);
      showAlert('Failed to create task', 'error');
    }
  };

  const handleUpdateTask = async (taskId) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, editingTask);
      fetchTasks();
      setEditingTask(null);
      showAlert('Task updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to update task:', error);
      showAlert('Failed to update task', 'error');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const response = await axios.post(`/api/tasks/${taskId}/complete`);
      showAlert(`Task completed! Earned ${response.data.coins_earned} coins`, 'success');
      fetchTasks();
    } catch (error) {
      console.error('Failed to complete task:', error);
      showAlert('Failed to complete task', 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks(tasks.filter(task => task.id !== taskId));
      showAlert('Task deleted successfully!', 'success');
    } catch (error) {
      console.error('Failed to delete task:', error);
      showAlert('Failed to delete task', 'error');
    }
  };

  const resetNewTask = () => {
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      category: '',
      due_date: null,
      coins_reward: 10,
    });
  };

  const showAlert = (message, severity) => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 3000);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">To-Do List</Typography>
        <Box>
          <FormControl sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={filter}
              label="Filter"
              onChange={(e) => setFilter(e.target.value)}
              size="small"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add Task
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {filteredTasks.map((task) => (
          <Grid item xs={12} key={task.id}>
            <Paper sx={{ p: 2 }}>
              <ListItem
                disableGutters
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={task.completed}
                    >
                      {task.completed ? <CheckCircleIcon color="success" /> : <UncheckedIcon />}
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => setEditingTask(task)}
                      disabled={task.completed}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        variant="h6"
                        sx={{
                          textDecoration: task.completed ? 'line-through' : 'none',
                          color: task.completed ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {task.title}
                      </Typography>
                      <Chip
                        label={task.priority}
                        color={getPriorityColor(task.priority)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                      {task.category && (
                        <Chip
                          label={task.category}
                          variant="outlined"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {task.description}
                      </Typography>
                      {task.due_date && (
                        <Typography variant="caption" color="text.secondary">
                          Due: {new Date(task.due_date).toLocaleString()}
                        </Typography>
                      )}
                      <Typography variant="caption" color="primary" sx={{ display: 'block' }}>
                        Reward: {task.coins_reward} coins
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog || !!editingTask} onClose={() => {
        setOpenDialog(false);
        setEditingTask(null);
      }} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            value={editingTask?.title || newTask.title}
            onChange={(e) => editingTask
              ? setEditingTask({ ...editingTask, title: e.target.value })
              : setNewTask({ ...newTask, title: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={editingTask?.description || newTask.description}
            onChange={(e) => editingTask
              ? setEditingTask({ ...editingTask, description: e.target.value })
              : setNewTask({ ...newTask, description: e.target.value })
            }
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Priority</InputLabel>
            <Select
              value={editingTask?.priority || newTask.priority}
              label="Priority"
              onChange={(e) => editingTask
                ? setEditingTask({ ...editingTask, priority: e.target.value })
                : setNewTask({ ...newTask, priority: e.target.value })
              }
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Category"
            fullWidth
            value={editingTask?.category || newTask.category}
            onChange={(e) => editingTask
              ? setEditingTask({ ...editingTask, category: e.target.value })
              : setNewTask({ ...newTask, category: e.target.value })
            }
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Due Date"
              value={editingTask?.due_date || newTask.due_date}
              onChange={(newValue) => editingTask
                ? setEditingTask({ ...editingTask, due_date: newValue })
                : setNewTask({ ...newTask, due_date: newValue })
              }
              renderInput={(params) => <TextField {...params} fullWidth margin="dense" />}
            />
          </LocalizationProvider>
          <TextField
            margin="dense"
            label="Coins Reward"
            type="number"
            fullWidth
            value={editingTask?.coins_reward || newTask.coins_reward}
            onChange={(e) => editingTask
              ? setEditingTask({ ...editingTask, coins_reward: parseInt(e.target.value) })
              : setNewTask({ ...newTask, coins_reward: parseInt(e.target.value) })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDialog(false);
            setEditingTask(null);
          }}>
            Cancel
          </Button>
          <Button
            onClick={() => editingTask ? handleUpdateTask(editingTask.id) : handleCreateTask()}
            variant="contained"
          >
            {editingTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TodoList;
