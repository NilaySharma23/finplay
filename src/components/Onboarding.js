import React, { useState, useEffect } from 'react';
import { Typography, Box, TextField, Button, CircularProgress, Alert, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { gamificationStyles } from '../theme';

function Onboarding() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkUserData = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = doc(db, 'users', auth.currentUser.uid);
          const docSnap = await getDoc(userDoc);
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Safeguard: If already fully onboarded, redirect to dashboard
            if (data.username && data.language) {
              localStorage.setItem('language', data.language);
              navigate('/dashboard');
              return;
            }
            // Load any existing partial data
            setUsername(data.username || '');
            setName(data.name || '');
            setAge(data.age || '');
            setLanguage(data.language || language);
          }
        } catch (err) {
          setError('Error loading user data. Please try again.');
          console.error('Error in checkUserData:', err);
        }
      }
      setLoading(false);
    };
    checkUserData();
  }, [navigate, language]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!age || isNaN(age) || age < 1 || age > 150) {
      setError('Please enter a valid age.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const userDoc = doc(db, 'users', auth.currentUser.uid);
      // Use merge: true to preserve existing fields (e.g., progress, portfolio)
      await setDoc(userDoc, {
        username,
        name,
        age: Number(age),
        language,
        // Only set initials if not already present (merge won't overwrite existing)
        progress: { basics: 0, risk: 0, algo: 0, portfolio: 0 },
        badges: [],
        streak: { count: 0, lastActive: null },
        dailyChallenge: { answeredToday: false, lastAnswered: null },
        virtualBalance: 100000,
        portfolio: [],
        gamePoints: 0,
      }, { merge: true });

      localStorage.setItem('language', language);
      navigate('/dashboard');
    } catch (err) {
      setError('Error saving onboarding data. Please try again.');
      console.error('Error in handleSubmit:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 8 }} className="loading-spinner" />;
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8, p: 4 }} className="glass-card neon-blue">
      <Typography variant="h4" gutterBottom className="gradient-text">Complete Onboarding</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} className="error-state">{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          sx={{ mb: 3 }}
          required
        />
        <TextField
          fullWidth
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          sx={{ mb: 3 }}
          required
        />
        <TextField
          fullWidth
          label="Age"
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          disabled={loading}
          sx={{ mb: 3 }}
          required
        />
        <FormControl sx={{ mb: 3 }}>
          <FormLabel>Preferred Language</FormLabel>
          <RadioGroup value={language} onChange={(e) => setLanguage(e.target.value)}>
            <FormControlLabel value="en" control={<Radio />} label="English" />
            <FormControlLabel value="hi" control={<Radio />} label="Hindi" />
            <FormControlLabel value="ta" control={<Radio />} label="Tamil" />
            <FormControlLabel value="Te" control={<Radio />} label="Telegu" />
            <FormControlLabel value="Bn" control={<Radio />} label="Bengali" />
            <FormControlLabel value="Ma" control={<Radio />} label="Marathi" />
          </RadioGroup>
        </FormControl>
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} className="btn-primary">
          Save and Continue
        </Button>
      </Box>
    </Box>
  );
}

export default Onboarding;