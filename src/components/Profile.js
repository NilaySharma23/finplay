import React, { useState, useEffect } from 'react';
import { Typography, Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Avatar, Chip, LinearProgress } from '@mui/material';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { gamificationStyles } from '../theme';
import Compressor from 'compressorjs';

function Profile() {
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [language, setLanguage] = useState('en');
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const maxFileSize = 2 * 1024 * 1024; // 2MB limit

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) {
        setError('Please log in to view your profile.');
        setLoading(false);
        return;
      }
      try {
        const userDoc = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setUsername(data.username || '');
          setName(data.name || '');
          setEmail(auth.currentUser.email || '');
          setAge(data.age || '');
          setLanguage(data.language || 'en');
          setPreviewUrl(data.profilePicture || '');
        } else {
          setError('User profile not found. Please complete onboarding.');
        }
      } catch (err) {
        setError('Error loading profile. Please try again.');
        console.error('Error in fetchUserData:', err);
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > maxFileSize) {
        setError('Image size must be less than 2MB.');
        setProfilePicture(null);
        setPreviewUrl(userData?.profilePicture || '');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (e.g., JPG, PNG).');
        setProfilePicture(null);
        setPreviewUrl(userData?.profilePicture || '');
        return;
      }
      new Compressor(file, {
        quality: 0.6,
        maxWidth: 200,
        maxHeight: 200,
        success(compressedFile) {
          setProfilePicture(compressedFile);
          setPreviewUrl(URL.createObjectURL(compressedFile));
          setError('');
        },
        error(err) {
          setError('Error compressing image.');
          setProfilePicture(null);
          setPreviewUrl(userData?.profilePicture || '');
          console.error('Compression error:', err);
        },
      });
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) {
      setError('Please log in to update your profile.');
      return;
    }
    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Re-authenticate if updating email or password
      if (email !== auth.currentUser.email || password) {
        if (!currentPassword) {
          setError('Please enter your current password to update email or password.');
          setLoading(false);
          return;
        }
        const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
      }

      const userDoc = doc(db, 'users', auth.currentUser.uid);
      const updates = {
        username,
        name,
        age: age ? parseInt(age) : null,
        language,
      };

      // Upload profile picture to Firebase Storage if selected
      if (profilePicture) {
        const storageRef = ref(storage, `profilePics/${auth.currentUser.uid}/${profilePicture.name}`);
        const uploadTask = uploadBytesResumable(storageRef, profilePicture);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (err) => {
              setError(`Upload failed: ${err.message}`);
              setUploadProgress(0);
              setLoading(false);
              console.error('Upload error:', err);
              reject(err);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                updates.profilePicture = downloadURL;
                resolve();
              } catch (err) {
                setError(`Failed to get download URL: ${err.message}`);
                setUploadProgress(0);
                setLoading(false);
                console.error('Download URL error:', err);
                reject(err);
              }
            }
          );
        });
      }

      // Update email in Firebase Authentication
      if (email !== auth.currentUser.email) {
        await updateEmail(auth.currentUser, email);
      }

      // Update password in Firebase Authentication if provided
      if (password) {
        await updatePassword(auth.currentUser, password);
      }

      // Update Firestore document
      await setDoc(userDoc, updates, { merge: true });
      localStorage.setItem('language', language);
      setUserData({ ...userData, ...updates });
      setError('Profile updated successfully!');
      setProfilePicture(null);
      setCurrentPassword('');
      setPassword('');
      setUploadProgress(0);
    } catch (err) {
      setError(`Error updating profile: ${err.message}`);
      console.error('Error in handleSave:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userData) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 8 }} className="loading-spinner" />;
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6, mb: 6, p: 4 }} className="glass-card neon-blue">
      <Typography variant="h4" gutterBottom className="gradient-text">
        Your Profile
      </Typography>
      {error && (
        <Alert severity={error.includes('successfully') ? 'success' : 'error'} sx={{ mb: 2 }} className={error.includes('successfully') ? 'success-state' : 'error-state'}>
          {error}
        </Alert>
      )}
      <Box sx={{ ...gamificationStyles.progressCard, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Stats</Typography>
        <Typography variant="body1">Virtual Balance: ₹{(userData?.virtualBalance || 0).toLocaleString()}</Typography>
        <Typography variant="body1">Streak: {userData?.streak?.count || 0} Days</Typography>
        <Typography variant="body1">Badges: {userData?.badges?.length || 0}</Typography>
        <Box className="badge-showcase" sx={{ mt: 2 }}>
          {userData?.badges?.map((badge, index) => (
            <Chip key={index} label={badge} color="success" className="badge" sx={{ mr: 1 }} />
          ))}
        </Box>
      </Box>
      {uploadProgress > 0 && uploadProgress < 100 && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body2">Uploading: {Math.round(uploadProgress)}%</Typography>
          <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 1 }} />
        </Box>
      )}
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            src={previewUrl}
            sx={{
              width: 80,
              height: 80,
              bgcolor: !previewUrl ? '#20BEFF' : 'transparent',
              border: '2px solid #4A5568',
            }}
          >
            {!previewUrl && (username || auth.currentUser.email || 'U')[0].toUpperCase()}
          </Avatar>
          <Button
            variant="contained"
            component="label"
            className="btn-primary"
            disabled={loading}
          >
            Upload Profile Picture
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
              disabled={loading}
            />
          </Button>
        </Box>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          required
          disabled={loading}
        />
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          disabled={loading}
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          disabled={loading}
        />
        <TextField
          label="Age"
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          fullWidth
          disabled={loading}
        />
        <TextField
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          fullWidth
          placeholder="Required if changing email or password"
          disabled={loading}
        />
        <TextField
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          placeholder="Enter new password (leave blank to keep current)"
          disabled={loading}
        />
        <FormControl fullWidth>
          <InputLabel>Language</InputLabel>
          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            label="Language"
            disabled={loading}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="hi">Hindi</MenuItem>
            <MenuItem value="ta">Tamil</MenuItem>
            <MenuItem value="te">Telugu</MenuItem>
            <MenuItem value="bn">Bengali</MenuItem>
            <MenuItem value="mr">Marathi</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={loading || !username || !email}
          className="btn-primary"
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
}

export default Profile;