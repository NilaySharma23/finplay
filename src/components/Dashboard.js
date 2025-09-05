import React, { useState, useEffect } from 'react';
import { Typography, Box, Card, CardContent, LinearProgress, Chip, Grid, CircularProgress, Alert, Radio, RadioGroup, FormControlLabel, FormControl, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import CodeIcon from '@mui/icons-material/Code';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { gamificationStyles } from '../theme';

function Dashboard() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [experience, setExperience] = useState(localStorage.getItem('experience') || 'beginner');
  const [progress, setProgress] = useState({
    basics: 0,
    risk: 0,
    algo: 0,
    portfolio: 0,
  });
  const [badges, setBadges] = useState([]);
  const [streak, setStreak] = useState({ count: 0, lastActive: null });
  const [dailyChallenge, setDailyChallenge] = useState({
    answeredToday: false,
    lastAnswered: null,
    selectedAnswer: '',
    correctAnswer: 'A share in a company',
    question: 'What is a stock?',
    options: [
      'A type of debt',
      'A share in a company',
      'A government bond',
      'A fixed deposit',
    ],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const dailyTips = [
    'Diversify your portfolio to reduce risk, like spreading your bets across different games!',
    'Start small with SIPs to build wealth over time without needing a large sum.',
    'Always research a company’s fundamentals before investing, not just its stock price.',
  ];
  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = doc(db, 'users', auth.currentUser.uid);
          const docSnap = await getDoc(userDoc);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setLanguage(data.language || language);
            setExperience(data.experience || experience);
            setProgress(data.progress || progress);
            setBadges(data.badges || []);
            setStreak(data.streak || { count: 0, lastActive: null });
            setDailyChallenge({
              ...dailyChallenge,
              answeredToday: data.dailyChallenge?.lastAnswered === new Date().toISOString().split('T')[0],
              lastAnswered: data.dailyChallenge?.lastAnswered || null,
            });
            localStorage.setItem('language', data.language || language);
            localStorage.setItem('experience', data.experience || experience);
          }
        } catch (err) {
          setError('Error loading user data. Please try again.');
          console.error('Error in fetchUserData:', err);
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);
  useEffect(() => {
    const updateStreak = async () => {
      if (!auth.currentUser) return;
      try {
        const today = new Date().toISOString().split('T')[0];
        if (streak.lastActive !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const newStreak = {
            count: streak.lastActive === yesterday.toISOString().split('T')[0] ? streak.count + 1 : 1,
            lastActive: today,
          };
          setStreak(newStreak);
          await setDoc(doc(db, 'users', auth.currentUser.uid), { streak: newStreak }, { merge: true });
        }
      } catch (err) {
        setError('Error updating streak. Please try again.');
        console.error('Error in updateStreak:', err);
      }
    };
    updateStreak();
  }, [streak]);
  const modules = [
    { id: 'basics', title: 'Basics of Stock Market', progress: progress.basics, badge: 'Market Starter', icon: <TrendingUpIcon /> },
    { id: 'risk', title: 'Risk & Diversification', progress: progress.risk, badge: 'Risk Warrior', icon: <SecurityIcon /> },
    { id: 'algo', title: 'Intro to Algo Trading / HFT', progress: progress.algo, badge: 'Algo Explorer', icon: <CodeIcon /> },
    { id: 'portfolio', title: 'Portfolio Building', progress: progress.portfolio, badge: 'Portfolio Champ', icon: <AccountBalanceIcon /> },
  ];
  const handleDailyChallengeSubmit = async () => {
    if (!auth.currentUser || dailyChallenge.answeredToday) return;
    try {
      const isCorrect = dailyChallenge.selectedAnswer.trim() === dailyChallenge.correctAnswer.trim();
      if (isCorrect) {
        setProgress((prev) => {
          const newProgress = { ...prev, basics: Math.min(prev.basics + 10, 100) };
          const newBadges = badges.includes('Daily Scholar') ? badges : [...badges, 'Daily Scholar'];
          setBadges(newBadges);
          const userDoc = doc(db, 'users', auth.currentUser.uid);
          setDoc(userDoc, {
            progress: newProgress,
            badges: newBadges,
            dailyChallenge: {
              lastAnswered: new Date().toISOString().split('T')[0],
            },
          }, { merge: true });
          return newProgress;
        });
        setDailyChallenge({ ...dailyChallenge, answeredToday: true, selectedAnswer: '' });
        setError('Correct! You earned 10% progress and a Daily Scholar badge!');
      } else {
        setError('Incorrect answer. Try again tomorrow!');
        setDailyChallenge({ ...dailyChallenge, answeredToday: true, selectedAnswer: '' });
        const userDoc = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userDoc, {
          dailyChallenge: {
            lastAnswered: new Date().toISOString().split('T')[0],
          },
        }, { merge: true });
      }
    } catch (err) {
      setError('Error submitting daily challenge. Please try again.');
      console.error('Error in handleDailyChallengeSubmit:', err);
    }
  };

  if (loading) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 8 }} className="loading-spinner" />;
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 6, mb: 6, p: 4 }} className="glass-card neon-blue">
      {error && <Alert severity={error.includes('Correct') ? 'success' : 'error'} sx={{ mb: 2 }} className={error.includes('Correct') ? 'success-state' : 'error-state'}>{error}</Alert>}
      <Typography variant="h4" gutterBottom className="gradient-text">Your Learning Journey</Typography>
      <Typography variant="body1" gutterBottom>
        Welcome back! You’re learning in {language.toUpperCase()} as a {experience} investor.
      </Typography>
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          background: '#2D3748', 
          padding: '6px 12px', 
          borderRadius: '16px',
          border: '1px solid #4A5568'
        }}>
          <LocalFireDepartmentIcon sx={{ color: '#F7FAFC', fontSize: '1.2rem' }} />
          <Typography variant="body2" sx={{ color: '#F7FAFC' }}>
            Streak: {streak.count} Day{streak.count !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Box className="badge-showcase" sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {badges.length > 0 ? (
            badges.map((badge, index) => (
              <Chip key={index} label={badge} color="success" className="badge" />
            ))
          ) : (
            <Typography variant="body2" sx={{ color: '#A0AEC0' }}>
              No badges yet
            </Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ mt: 4, mb: 4 }} className="daily-challenge">
        <Typography variant="h5" gutterBottom>Daily</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Daily Challenge</Typography>
            {dailyChallenge.answeredToday ? (
              <Typography variant="body1">You’ve completed today’s challenge! Come back tomorrow for a new one.</Typography>
            ) : (
              <>
                <Typography variant="body1" gutterBottom>{dailyChallenge.question}</Typography>
                <FormControl component="fieldset">
                  <RadioGroup
                    value={dailyChallenge.selectedAnswer}
                    onChange={(e) => setDailyChallenge({ ...dailyChallenge, selectedAnswer: e.target.value.trim() })}
                  >
                    {dailyChallenge.options.map((option, index) => (
                      <FormControlLabel
                        key={index}
                        value={option}
                        control={<Radio />}
                        label={option}
                        disabled={dailyChallenge.answeredToday}
                        className="quiz-option"
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDailyChallengeSubmit}
                  disabled={!dailyChallenge.selectedAnswer || dailyChallenge.answeredToday}
                  sx={{ mt: 2 }}
                  className="btn-primary"
                >
                  Submit Answer
                </Button>
              </>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Daily Tip</Typography>
            <Typography variant="body1">{dailyTips[Math.floor(Math.random() * dailyTips.length)]}</Typography>
          </Grid>
        </Grid>
      </Box>
      <Typography variant="h5" gutterBottom>Courses</Typography>
      <Grid container spacing={3}>
        {modules.map((module) => (
          <Grid item xs={12} sm={6} md={3} key={module.id}>
            <Card sx={{ ...gamificationStyles.moduleCard, minHeight: 200 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  {module.icon}
                  <Typography variant="h6">{module.title}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={module.progress} 
                  sx={{ 
                    mt: 1, 
                    mb: 1, 
                    backgroundColor: '#4A5568', 
                    '& .MuiLinearProgress-bar': { 
                      backgroundColor: '#20BEFF' 
                    } 
                  }} 
                />
                <Typography variant="body2" sx={{ mb: 2 }}>{module.progress}% Complete</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/learn/${module.id}`)}
                  fullWidth
                  className="btn-primary"
                >
                  {module.progress > 0 ? 'Resume Learning' : 'Start Learning'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
export default Dashboard;