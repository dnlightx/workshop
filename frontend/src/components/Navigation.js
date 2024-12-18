import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Timer as TimerIcon,
  CheckCircle as TaskIcon,
  Favorite as HabitIcon,
  Store as StoreIcon,
  Assessment as ProgressIcon,
  EmojiEvents as LeaderboardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const pages = [
    { name: 'Tasks', icon: <TaskIcon />, path: '/tasks' },
    { name: 'Pomodoro', icon: <TimerIcon />, path: '/pomodoro' },
    { name: 'Habits', icon: <HabitIcon />, path: '/habits' },
    { name: 'Store', icon: <StoreIcon />, path: '/store' },
    { name: 'Progress', icon: <ProgressIcon />, path: '/progress' },
    { name: 'Leaderboard', icon: <LeaderboardIcon />, path: '/leaderboard' },
  ];

  const settings = [
    { name: 'Profile', action: () => navigate('/profile') },
    { name: 'Settings', action: () => navigate('/settings') },
    { name: 'Logout', action: logout },
  ];

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMenuClick = (path) => {
    navigate(path);
    handleCloseNavMenu();
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo - Mobile */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page.name} onClick={() => handleMenuClick(page.path)}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {page.icon}
                    <Typography sx={{ ml: 1 }}>{page.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Logo - Desktop */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: { xs: 1, md: 0 },
              display: { xs: 'flex', md: 'flex' },
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            TaskRewards
          </Typography>

          {/* Navigation - Desktop */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 2 }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                onClick={() => handleMenuClick(page.path)}
                sx={{
                  my: 2,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                }}
                startIcon={page.icon}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          {/* User Menu */}
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
            {user && (
              <Typography variant="body2" sx={{ mr: 2 }}>
                {user.coins} coins
              </Typography>
            )}
            <IconButton
              size="large"
              aria-label="show notifications"
              color="inherit"
              sx={{ mr: 2 }}
            >
              <Badge badgeContent={0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={user?.username}>
                  <AccountCircle />
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting.name}
                  onClick={() => {
                    setting.action();
                    handleCloseUserMenu();
                  }}
                >
                  <Typography textAlign="center">{setting.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation;
