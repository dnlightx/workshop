import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Switch,
  useTheme,
} from '@mui/material';
import {
  Timer,
  CheckCircle,
  Timeline,
  TrendingUp,
  EmojiEvents,
  Store,
  Leaderboard,
  Settings,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleClose();
  };

  const handleThemeToggle = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  const navItems = [
    { text: 'Pomodoro', icon: <Timer />, path: '/pomodoro' },
    { text: 'To-Do', icon: <CheckCircle />, path: '/todo' },
    { text: 'Habits', icon: <Timeline />, path: '/habits' },
    { text: 'Progress', icon: <TrendingUp />, path: '/progress' },
    { text: 'Challenges', icon: <EmojiEvents />, path: '/challenges' },
    { text: 'Store', icon: <Store />, path: '/store' },
    { text: 'Leaderboard', icon: <Leaderboard />, path: '/leaderboard' },
  ];

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Brand/Logo */}
        <Typography
          variant="h6"
          component="div"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          TaskRewards
        </Typography>

        {/* Navigation Items */}
        <Box sx={{ flexGrow: 1, display: 'flex', ml: 4 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                mx: 1,
                color: location.pathname === item.path ? 'secondary.main' : 'inherit',
              }}
            >
              {item.text}
            </Button>
          ))}
        </Box>

        {/* Theme Toggle */}
        <IconButton color="inherit" onClick={handleThemeToggle}>
          {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
        </IconButton>

        {/* Profile Menu */}
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
          color="inherit"
        >
          <Avatar alt="User" src="/static/images/avatar/1.jpg" />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={() => handleNavigate('/profile')}>
            <Settings sx={{ mr: 1 }} /> Profile
          </MenuItem>
          <MenuItem onClick={() => handleNavigate('/login')}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
