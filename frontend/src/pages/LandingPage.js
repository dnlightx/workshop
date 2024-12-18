import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Star,
} from '@mui/icons-material';

const LandingPage = () => {
  const navigate = useNavigate();

  const reviews = [
    {
      name: 'John Doe',
      rating: 5,
      text: 'This app has completely transformed my productivity!',
    },
    {
      name: 'Jane Smith',
      rating: 5,
      text: 'Love how it gamifies my daily tasks. So motivating!',
    },
    {
      name: 'Mike Johnson',
      rating: 4,
      text: 'Great way to build better habits and stay focused.',
    },
  ];

  const sponsors = [
    'TechCorp Inc.',
    'ProductivityPro',
    'FocusLabs',
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          TaskRewards
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Turn your tasks into rewards and build better habits
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
            sx={{ mr: 2 }}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/register')}
          >
            Get Started
          </Button>
        </Box>
      </Box>

      {/* Reviews Section */}
      <Box sx={{ my: 8 }}>
        <Typography variant="h4" textAlign="center" gutterBottom>
          What Our Users Say
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {reviews.map((review, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', mb: 1 }}>
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} sx={{ color: 'gold' }} />
                    ))}
                  </Box>
                  <Typography variant="body1" paragraph>
                    "{review.text}"
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    - {review.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Sponsors Section */}
      <Box sx={{ my: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Our Sponsors
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {sponsors.map((sponsor, index) => (
            <Grid item key={index}>
              <Typography variant="h6" color="text.secondary">
                {sponsor}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Social Icons */}
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <IconButton color="primary" aria-label="facebook">
          <Facebook />
        </IconButton>
        <IconButton color="primary" aria-label="twitter">
          <Twitter />
        </IconButton>
        <IconButton color="primary" aria-label="instagram">
          <Instagram />
        </IconButton>
        <IconButton color="primary" aria-label="linkedin">
          <LinkedIn />
        </IconButton>
      </Box>
    </Container>
  );
};

export default LandingPage;
