import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Star as StarIcon,
  ShoppingCart as ShoppingCartIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import axios from 'axios';

const Store = () => {
  const [rewards, setRewards] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newReward, setNewReward] = useState({
    name: '',
    description: '',
    coins_cost: 0,
    is_premium: false,
  });
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
  const [userCoins, setUserCoins] = useState(0);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await axios.get('/api/rewards');
      setRewards(response.data.rewards);
      // In a real app, you'd get these from user context/state
      setUserCoins(response.data.user_coins || 0);
      setIsPremium(response.data.is_premium || false);
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
      showAlert('Failed to load rewards', 'error');
    }
  };

  const handleCreateReward = async () => {
    try {
      await axios.post('/api/rewards', newReward);
      setOpenDialog(false);
      setNewReward({ name: '', description: '', coins_cost: 0, is_premium: false });
      fetchRewards();
      showAlert('Reward created successfully!', 'success');
    } catch (error) {
      if (error.response?.status === 403) {
        showAlert('Premium subscription required to create custom rewards', 'error');
      } else {
        showAlert('Failed to create reward', 'error');
      }
    }
  };

  const handleRedeemReward = async (rewardId) => {
    try {
      const response = await axios.post(`/api/rewards/${rewardId}/redeem`);
      setUserCoins(response.data.remaining_coins);
      showAlert('Reward redeemed successfully!', 'success');
    } catch (error) {
      if (error.response?.status === 403) {
        showAlert('Premium subscription required for this reward', 'error');
      } else if (error.response?.status === 400) {
        showAlert('Insufficient coins', 'error');
      } else {
        showAlert('Failed to redeem reward', 'error');
      }
    }
  };

  const showAlert = (message, severity) => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 3000);
  };

  return (
    <Box sx={{ p: 3 }}>
      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Reward Store</Typography>
        <Box>
          <Chip
            icon={<StarIcon />}
            label={`${userCoins} coins`}
            color="primary"
            sx={{ mr: 2 }}
          />
          {isPremium && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Create Reward
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {rewards.map((reward) => (
          <Grid item xs={12} sm={6} md={4} key={reward.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" gutterBottom>
                    {reward.name}
                  </Typography>
                  {reward.is_premium && (
                    <IconButton size="small" color="primary">
                      <LockIcon />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {reward.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  {reward.coins_cost} coins
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  startIcon={<ShoppingCartIcon />}
                  onClick={() => handleRedeemReward(reward.id)}
                  disabled={userCoins < reward.coins_cost || (reward.is_premium && !isPremium)}
                  fullWidth
                  variant="contained"
                >
                  Redeem
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Custom Reward</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reward Name"
            fullWidth
            value={newReward.name}
            onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={newReward.description}
            onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Coins Cost"
            type="number"
            fullWidth
            value={newReward.coins_cost}
            onChange={(e) => setNewReward({ ...newReward, coins_cost: parseInt(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateReward} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Store;
