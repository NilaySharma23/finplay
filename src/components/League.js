import React, { useState, useEffect } from 'react';
import { Typography, Box, Card, CardContent, Button, CircularProgress, Alert, TextField, Table, TableBody, TableCell, TableHead, TableRow, Grid } from '@mui/material';
import { collection, getDocs, doc, updateDoc, arrayUnion, addDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { gamificationStyles } from '../theme';

function League() {
  const [leagues, setLeagues] = useState([]);
  const [myLeagues, setMyLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newLeagueName, setNewLeagueName] = useState('');
  const [newLeagueDesc, setNewLeagueDesc] = useState('');

  useEffect(() => {
    const fetchLeagues = async () => {
      if (auth.currentUser) {
        try {
          const querySnapshot = await getDocs(collection(db, 'leagues'));
          const allLeagues = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          const userDoc = doc(db, 'users', auth.currentUser.uid);
          const userSnap = await getDoc(userDoc);
          const userLeagues = userSnap.exists() ? userSnap.data().leagues || [] : [];
          const joinedLeagues = allLeagues.filter((league) => userLeagues.includes(league.id));
          const availableLeagues = allLeagues.filter((league) => !userLeagues.includes(league.id));
          setMyLeagues(joinedLeagues);
          setLeagues(availableLeagues);
        } catch (err) {
          setError('Error loading leagues. Please try again.');
          console.error('Error in fetchLeagues:', err);
        }
        setLoading(false);
      }
    };
    fetchLeagues();
  }, []);

  const handleCreateLeague = async () => {
    if (!newLeagueName) {
      setError('Please enter a league name.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const leagueDoc = await addDoc(collection(db, 'leagues'), {
        name: newLeagueName,
        description: newLeagueDesc,
        creator: auth.currentUser.uid,
        members: [auth.currentUser.uid],
      });
      const userDoc = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDoc, {
        leagues: arrayUnion(leagueDoc.id),
      });
      setNewLeagueName('');
      setNewLeagueDesc('');
      setError('League created successfully!');
      // Refresh leagues
      const updatedMyLeagues = [...myLeagues, { id: leagueDoc.id, name: newLeagueName, description: newLeagueDesc, members: [auth.currentUser.uid] }];
      setMyLeagues(updatedMyLeagues);
    } catch (err) {
      setError('Error creating league. Please try again.');
      console.error('Error in handleCreateLeague:', err);
    }
    setLoading(false);
  };

  const handleJoinLeague = async (leagueId) => {
    if (!auth.currentUser) return;
    setLoading(true);
    setError('');
    try {
      const leagueDoc = doc(db, 'leagues', leagueId);
      await updateDoc(leagueDoc, {
        members: arrayUnion(auth.currentUser.uid),
      });
      const userDoc = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDoc, {
        leagues: arrayUnion(leagueId),
      });
      setError('Successfully joined the league!');
      // Refresh leagues
      const joinedLeague = leagues.find((league) => league.id === leagueId);
      if (joinedLeague) {
        joinedLeague.members = [...(joinedLeague.members || []), auth.currentUser.uid];
        setMyLeagues([...myLeagues, joinedLeague]);
        setLeagues(leagues.filter((league) => league.id !== leagueId));
      }
    } catch (err) {
      setError('Error joining league. Please try again.');
      console.error('Error in handleJoinLeague:', err);
    }
    setLoading(false);
  };

  const fetchLeaderboard = async (members) => {
    try {
      const leaderboard = await Promise.all(
        members.map(async (uid) => {
          const userDoc = doc(db, 'users', uid);
          const userSnap = await getDoc(userDoc);
          if (userSnap.exists()) {
            const data = userSnap.data();
            return {
              username: data.username || 'Anonymous',
              virtualBalance: data.virtualBalance || 0,
            };
          }
          console.warn(`User document not found for UID: ${uid}`);
          return { username: 'Unknown', virtualBalance: 0 };
        })
      );
      return leaderboard.sort((a, b) => b.virtualBalance - a.virtualBalance);
    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
      return [];
    }
  };

  if (loading) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 8 }} className="loading-spinner" />;
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4 }} className="glass-card neon-blue" style={{ padding: '40px', minHeight: 'calc(100vh - 120px)' }}>
      <Typography variant="h4" gutterBottom className="gradient-text">
        Leagues & Leaderboards
      </Typography>
      {error && (
        <Alert severity={error.includes('successfully') ? 'success' : 'error'} sx={{ mb: 2 }} className={error.includes('successfully') ? 'success-state' : 'error-state'}>
          {error}
        </Alert>
      )}
      <Box sx={{ ...gamificationStyles.progressCard, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Create League</Typography>
        <TextField
          label="League Name"
          value={newLeagueName}
          onChange={(e) => setNewLeagueName(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Description"
          value={newLeagueDesc}
          onChange={(e) => setNewLeagueDesc(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button variant="contained" color="primary" onClick={handleCreateLeague} disabled={loading} className="btn-primary">
          Create League
        </Button>
      </Box>
      <Box sx={{ ...gamificationStyles.progressCard, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Available Leagues</Typography>
        <Grid container spacing={2}>
          {leagues.map((league) => (
            <Grid item xs={12} md={6} key={league.id}>
              <Card sx={{ ...gamificationStyles.moduleCard, minHeight: 150 }}>
                <CardContent>
                  <Typography variant="h6">{league.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {league.description}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Members: {league.members?.length || 0}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleJoinLeague(league.id)}
                    disabled={loading}
                    sx={{ mt: 2 }}
                    className="btn-primary"
                  >
                    Join League
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {leagues.length === 0 && <Typography>No available leagues to join.</Typography>}
      </Box>
      <Box sx={{ ...gamificationStyles.progressCard }}>
        <Typography variant="h5" gutterBottom>My Leagues</Typography>
        {myLeagues.map((league) => (
          <Box key={league.id} sx={{ mb: 4 }}>
            <Typography variant="h6">{league.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {league.description}
            </Typography>
            <LeaderboardTable leagueId={league.id} />
          </Box>
        ))}
        {myLeagues.length === 0 && <Typography>You haven't joined any leagues yet.</Typography>}
      </Box>
    </Box>
  );
}

function LeaderboardTable({ leagueId }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeagueLeaderboard = async () => {
      try {
        console.log(`Fetching leaderboard for leagueId: ${leagueId}`);
        const leagueDoc = doc(db, 'leagues', leagueId);
        const leagueSnap = await getDoc(leagueDoc);
        if (!leagueSnap.exists()) {
          console.error(`League document ${leagueId} not found`);
          setError('League not found.');
          setLoading(false);
          return;
        }
        const leagueData = leagueSnap.data();
        console.log(`League data:`, leagueData);
        const members = leagueData.members || [];
        console.log(`Members found:`, members);
        if (members.length === 0) {
          console.log('No members in this league');
          setLeaderboard([]);
          setLoading(false);
          return;
        }
        const leaderboardData = await Promise.all(
          members.map(async (uid) => {
            console.log(`Fetching user data for UID: ${uid}`);
            const userDoc = doc(db, 'users', uid);
            const userSnap = await getDoc(userDoc);
            if (userSnap.exists()) {
              const data = userSnap.data();
              console.log(`User data for ${uid}:`, data);
              return {
                username: data.username || 'Anonymous',
                virtualBalance: data.virtualBalance || 0,
              };
            }
            console.warn(`User document not found for UID: ${uid}`);
            return { username: 'Unknown', virtualBalance: 0 };
          })
        );
        const sortedLeaderboard = leaderboardData.sort((a, b) => b.virtualBalance - a.virtualBalance);
        console.log(`Sorted leaderboard:`, sortedLeaderboard);
        setLeaderboard(sortedLeaderboard);
      } catch (err) {
        console.error('Error in fetchLeagueLeaderboard:', err);
        setError('Error loading leaderboard. Please check permissions or data. See console for details.');
      }
      setLoading(false);
    };
    fetchLeagueLeaderboard();
  }, [leagueId]);

  if (loading) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto' }} className="loading-spinner" />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Rank</TableCell>
          <TableCell>Username</TableCell>
          <TableCell>Portfolio Value</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {leaderboard.map((user, index) => (
          <TableRow key={index}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{user.username}</TableCell>
            <TableCell>₹{user.virtualBalance.toLocaleString()}</TableCell>
          </TableRow>
        ))}
        {leaderboard.length === 0 && (
          <TableRow>
            <TableCell colSpan={3}>No members in this league yet.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default League;