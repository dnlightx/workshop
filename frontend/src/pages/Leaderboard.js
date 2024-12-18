import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  WorkspacePremium as PremiumIcon,
} from '@mui/icons-material';
import axios from 'axios';

const Leaderboard = () => {
  const [timeframe, setTimeframe] = useState('weekly');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/leaderboard?timeframe=${timeframe}`);
      setLeaderboardData(response.data.leaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPositionColor = (position) => {
    switch (position) {
      case 0:
        return '#FFD700'; // Gold
      case 1:
        return '#C0C0C0'; // Silver
      case 2:
        return '#CD7F32'; // Bronze
      default:
        return 'transparent';
    }
  };

  const renderRankIcon = (position) => {
    if (position > 2) return null;
    return (
      <TrophyIcon
        sx={{
          color: getPositionColor(position),
          marginRight: 1,
        }}
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Leaderboard</Typography>
        <ToggleButtonGroup
          value={timeframe}
          exclusive
          onChange={(e, newTimeframe) => newTimeframe && setTimeframe(newTimeframe)}
          aria-label="timeframe"
        >
          <ToggleButton value="weekly" aria-label="weekly">
            Weekly
          </ToggleButton>
          <ToggleButton value="monthly" aria-label="monthly">
            Monthly
          </ToggleButton>
          <ToggleButton value="all-time" aria-label="all-time">
            All Time
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>User</TableCell>
              <TableCell align="right">Tasks Completed</TableCell>
              <TableCell align="right">Total Streak</TableCell>
              <TableCell align="right">Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboardData.map((entry, index) => (
              <TableRow
                key={entry.user_id}
                sx={{
                  backgroundColor: index < 3 ? `${getPositionColor(index)}10` : 'inherit',
                  '&:hover': {
                    backgroundColor: index < 3 ? `${getPositionColor(index)}20` : 'action.hover',
                  },
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {renderRankIcon(index)}
                    #{index + 1}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      alt={entry.username}
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${entry.username}`}
                      sx={{ width: 32, height: 32, mr: 1 }}
                    />
                    <Box>
                      <Typography variant="body1">
                        {entry.username}
                      </Typography>
                      {entry.is_premium && (
                        <Chip
                          icon={<PremiumIcon />}
                          label="Premium"
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right">{entry.tasks_completed}</TableCell>
                <TableCell align="right">{entry.total_streak} days</TableCell>
                <TableCell align="right">
                  <Typography variant="body1" fontWeight="bold">
                    {entry.tasks_completed * 10 + entry.total_streak * 5}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Scoring System
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Each completed task: 10 points
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Each day of streak: 5 points
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Premium users get 1.5x points multiplier
        </Typography>
      </Box>
    </Box>
  );
};

export default Leaderboard;
