import React from 'react';
import { Typography, Box, Button, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { gamificationStyles } from '../theme';

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Learn & Earn',
      description: 'Master financial concepts through interactive courses and earn badges as you progress. Start with the basics of the stock market and advance to complex strategies like algorithmic trading.',
      icon: '📚',
    },
    {
      title: 'Virtual Trading',
      description: 'Practice trading with virtual money in a risk-free environment. Test your strategies, track performance, and build confidence without spending a dime.',
      icon: '💹',
    },
    {
      title: 'Compete & Win',
      description: 'Join leaderboards and fantasy leagues to compete with others. Showcase your trading skills and climb the ranks to win exciting rewards.',
      icon: '🏆',
    },
    {
      title: 'AI-Powered Learning',
      description: 'Get personalized guidance from our AI Buddy. Ask questions, get real-time answers, and receive tailored tips to enhance your financial knowledge.',
      icon: '🤖',
    },
    {
      title: 'Fantasy Leagues',
      description: 'Create or join fantasy trading leagues with friends or the community. Compete in simulated markets and prove your investment prowess.',
      icon: '👥',
    },
  ];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 6, mb: 6, p: 4 }} className="glass-card neon-blue">
      <Typography variant="h3" align="center" className="gradient-text" gutterBottom>
        Welcome to FinPlay
      </Typography>
      <Typography variant="h6" align="center" sx={{ mb: 4, color: '#CBD5E0' }}>
        Your fun journey to financial literacy starts here!
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/login')}
          className="btn-primary"
          sx={{ px: 4, py: 1.5 }}
        >
          Get Started
        </Button>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {features.map((feature, index) => (
          <Card key={index} sx={{ ...gamificationStyles.moduleCard, minHeight: 200, width: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h3">{feature.icon}</Typography>
                <Typography variant="h6">{feature.title}</Typography>
              </Box>
              <Typography variant="body1" sx={{ color: '#CBD5E0' }}>
                {feature.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

export default Home;