import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, FormControlLabel, Switch, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { gamificationStyles } from '../theme';

function Settings() {
  const navigate = useNavigate();
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState(localStorage.getItem('notificationsEnabled') === 'true');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleThemeToggle = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
    localStorage.setItem('themeMode', newMode);
    // Note: Actual theme switching requires updating the ThemeProvider in App.js
  };

  const handleNotificationsToggle = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem('notificationsEnabled', newValue);
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;
    if (!window.confirm('Are you sure you want to delete your account? This action is irreversible.')) return;
    setLoading(true);
    try {
      const userDoc = doc(db, 'users', auth.currentUser.uid);
      await deleteDoc(userDoc);
      const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
      try {
        await deleteObject(storageRef);
      } catch (err) {
        console.warn('No profile picture to delete or error:', err);
      }
      await deleteUser(auth.currentUser);
      localStorage.removeItem('language');
      localStorage.removeItem('themeMode');
      localStorage.removeItem('notificationsEnabled');
      navigate('/login', { replace: true });
    } catch (err) {
      setError('Error deleting account. Please try again.');
      console.error('Error in handleDeleteAccount:', err);
    }
    setLoading(false);
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const userDoc = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `finplay_user_data_${auth.currentUser.uid}.json`;
        link.click();
        URL.revokeObjectURL(url);
        setError('Data exported successfully!');
      } else {
        setError('No user data found to export.');
      }
    } catch (err) {
      setError('Error exporting data. Please try again.');
      console.error('Error in handleExportData:', err);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6, mb: 6, p: 4 }} className="glass-card neon-blue">
      <Typography variant="h4" gutterBottom className="gradient-text">
        Settings
      </Typography>
      {error && (
        <Alert severity={error.includes('successfully') ? 'success' : 'error'} sx={{ mb: 2 }} className={error.includes('successfully') ? 'success-state' : 'error-state'}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/profile')}
          className="btn-primary"
        >
          User Profile
        </Button>
        <Box sx={{ ...gamificationStyles.progressCard, p: 2 }}>
          <Typography variant="h6" gutterBottom>Appearance</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={themeMode === 'dark'}
                onChange={handleThemeToggle}
                color="primary"
              />
            }
            label={themeMode === 'dark' ? 'Dark Theme' : 'Light Theme'}
          />
        </Box>
        <Box sx={{ ...gamificationStyles.progressCard, p: 2 }}>
          <Typography variant="h6" gutterBottom>Notifications</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={notificationsEnabled}
                onChange={handleNotificationsToggle}
                color="primary"
              />
            }
            label="Enable Notifications"
          />
        </Box>
        <Box sx={{ ...gamificationStyles.progressCard, p: 2 }}>
          <Typography variant="h6" gutterBottom>Data Management</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleExportData}
            disabled={loading}
            className="btn-primary"
            sx={{ mb: 3, width: '100%' }}
          >
            Export My Data
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteAccount}
            disabled={loading}
            className="btn-secondary"
            sx={{ width: '100%' }}
          >
            Delete Account
          </Button>
        </Box>
      </Box>
      {loading && <CircularProgress sx={{ mt: 2 }} className="loading-spinner" />}
    </Box>
  );
}

export default Settings;