import React, { useState, useEffect } from 'react';
import { Typography, Box, TextField, Button, CircularProgress, Alert, Tabs, Tab, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Simple seedable random number generator
function mulberry32(seed) {
  let t = seed += 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

function seedFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return hash;
}

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function DemosAndGames() {
  const [tab, setTab] = useState(0);
  const [symbol, setSymbol] = useState('');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prediction, setPrediction] = useState('');
  const [gameResult, setGameResult] = useState('');
  const [points, setPoints] = useState(0);
  const [riskChoice, setRiskChoice] = useState('');
  const [riskResult, setRiskResult] = useState('');

  useEffect(() => {
    const fetchUserPoints = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = doc(db, 'users', auth.currentUser.uid);
          const docSnap = await getDoc(userDoc);
          if (docSnap.exists()) {
            setPoints(docSnap.data().gamePoints || 0);
          }
        } catch (err) {
          console.error('fetchUserPoints Error:', err.message);
          setError(`Error loading points: ${err.message}.`);
        }
      }
    };
    fetchUserPoints();
  }, []);

  const fetchChartData = async () => {
    setLoading(true);
    setError('');
    try {
      const seed = seedFromString(symbol || 'default');
      let currentSeed = seed;
      const random = () => {
        currentSeed += 1;
        return mulberry32(currentSeed);
      };
      const basePrice = random() * 1000 + 500;
      const prices = Array.from({ length: 30 }, () => {
        const variation = (random() - 0.5) * 0.2;
        return basePrice * (1 + variation);
      });
      const labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
      setChartData({
        labels,
        datasets: [
          {
            label: `${symbol} Price`,
            data: prices,
            borderColor: '#1976d2',
            backgroundColor: 'rgba(25, 118, 210, 0.2)',
            fill: true,
          },
        ],
      });
    } catch (err) {
      console.error('fetchChartData Error:', err.message);
      setError(`Error fetching chart data: ${err.message}. Please check the symbol (e.g., RELIANCE.NS).`);
      setChartData(null);
    }
    setLoading(false);
  };

  const handlePrediction = async (guess) => {
    setLoading(true);
    setError('');
    setGameResult('');
    try {
      const seed = seedFromString(symbol || 'default');
      let currentSeed = seed;
      const random = () => {
        currentSeed += 1;
        return mulberry32(currentSeed);
      };
      const currentPrice = random() * 1000 + 500;
      const futurePrice = currentPrice * (1 + (random() - 0.5) * 0.05);
      const isCorrect = (guess === 'rise' && futurePrice > currentPrice) || (guess === 'fall' && futurePrice <= currentPrice);
      const resultText = isCorrect
        ? `Correct! ${symbol} price ${guess === 'rise' ? 'rose' : 'fell'} to ₹${futurePrice.toFixed(2)}. +10 points!`
        : `Wrong! ${symbol} price ${guess === 'rise' ? 'fell' : 'rose'} to ₹${futurePrice.toFixed(2)}.`;
      const newPoints = isCorrect ? points + 10 : points;
      setGameResult(resultText);
      setPoints(newPoints);
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), { gamePoints: newPoints }, { merge: true });
      }
      setPrediction('');
    } catch (err) {
      console.error('handlePrediction Error:', err.message);
      setError(`Error playing game: ${err.message}.`);
    }
    setLoading(false);
  };

  const handleRiskGame = async () => {
    setLoading(true);
    setError('');
    setRiskResult('');
    try {
      const seed = seedFromString(riskChoice || 'default');
      const random = () => mulberry32(seed + Math.floor(Math.random() * 100));
      const stockReturn = random() * 20 - 10; // -10% to +10%
      const bondReturn = random() * 5; // 0% to 5%
      const outcome = riskChoice === 'stock'
        ? `You chose stocks! They returned ${stockReturn.toFixed(2)}%. ${stockReturn > bondReturn ? 'Great choice, stocks outperformed bonds!' : 'Bonds would have been safer this time.'}`
        : `You chose bonds! They returned ${bondReturn.toFixed(2)}%. ${bondReturn > stockReturn ? 'Safe choice, bonds outperformed stocks!' : 'Stocks had higher returns this time.'}`;
      const newPoints = stockReturn > bondReturn && riskChoice === 'stock' || bondReturn > stockReturn && riskChoice === 'bond' ? points + 10 : points;
      setRiskResult(outcome);
      setPoints(newPoints);
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), { gamePoints: newPoints }, { merge: true });
      }
      setRiskChoice('');
    } catch (err) {
      console.error('handleRiskGame Error:', err.message);
      setError(`Error playing risk game: ${err.message}.`);
    }
    setLoading(false);
  };

  const myths = [
    {
      myth: 'Higher price means better stock.',
      fact: 'A high stock price doesn’t mean a stock is better. It’s about the company’s value and growth potential, not just the price per share.',
    },
    {
      myth: 'You need a lot of money to start investing.',
      fact: 'You can start with small amounts through SIPs or fractional shares. It’s about consistency, not big investments.',
    },
  ];

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 6, mb: 6, p: 4 }} className="glass-card neon-blue">
      <Typography variant="h4" gutterBottom className="gradient-text" sx={{ mb: 4 }}>
        Demos & Games
      </Typography>
      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mb: 4 }} className="game-tab">
        <Tab label="Stock Chart Demo" />
        <Tab label="Prediction Game" />
        <Tab label="Risk Assessment Game" />
        <Tab label="Market Myths Busted" />
      </Tabs>
      {tab === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>Stock Chart Demo</Typography>
          <Typography variant="body1" gutterBottom>Explore stock price trends with interactive charts.</Typography>
          <Box sx={{ mt: 2 }} className="chat-input-container">
            <TextField
              label="Stock Symbol (e.g., RELIANCE.NS)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              sx={{ mr: 2 }}
            />
            <Button variant="contained" color="primary" onClick={fetchChartData} disabled={loading || !symbol} className="btn-primary">
              Load Chart
            </Button>
          </Box>
          {error && <Alert severity="error" sx={{ mt: 2 }} className="error-state">{error}</Alert>}
          {loading && <CircularProgress sx={{ mt: 2 }} className="loading-spinner" />}
          {chartData && (
            <Box sx={{ mt: 4 }} className="chart-container">
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  plugins: { legend: { position: 'top' }, title: { display: true, text: `${symbol} Price Trend` } },
                }}
              />
            </Box>
          )}
        </Box>
      )}
      {tab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>Stock Prediction Game</Typography>
          <Typography variant="body1" gutterBottom>Guess if the stock price will rise or fall! Points: {points}</Typography>
          <Box sx={{ mt: 2 }} className="chat-input-container">
            <TextField
              label="Stock Symbol (e.g., RELIANCE.NS)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              sx={{ mr: 2 }}
            />
            <Button
              variant="contained"
              color="success"
              onClick={() => { setPrediction('rise'); handlePrediction('rise'); }}
              disabled={loading || !symbol}
              sx={{ mr: 2 }}
              className="btn-primary"
            >
              Predict Rise
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => { setPrediction('fall'); handlePrediction('fall'); }}
              disabled={loading || !symbol}
              className="btn-secondary"
            >
              Predict Fall
            </Button>
          </Box>
          {error && <Alert severity="error" sx={{ mt: 2 }} className="error-state">{error}</Alert>}
          {gameResult && <Alert severity={gameResult.includes('Correct') ? 'success' : 'warning'} sx={{ mt: 2 }} className={gameResult.includes('Correct') ? 'success-state' : 'error-state'}>{gameResult}</Alert>}
          {loading && <CircularProgress sx={{ mt: 2 }} className="loading-spinner" />}
        </Box>
      )}
      {tab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>Risk Assessment Game</Typography>
          <Typography variant="body1" gutterBottom>Choose between stocks or bonds and see the outcome! Points: {points}</Typography>
          <Box sx={{ mt: 2 }}>
            <RadioGroup
              value={riskChoice}
              onChange={(e) => setRiskChoice(e.target.value)}
            >
              <FormControlLabel value="stock" control={<Radio />} label="Invest in Stocks (Higher Risk, Higher Return)" className="quiz-option" />
              <FormControlLabel value="bond" control={<Radio />} label="Invest in Bonds (Lower Risk, Lower Return)" className="quiz-option" />
            </RadioGroup>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRiskGame}
              disabled={loading || !riskChoice}
              sx={{ mt: 2 }}
              className="btn-primary"
            >
              See Outcome
            </Button>
          </Box>
          {error && <Alert severity="error" sx={{ mt: 2 }} className="error-state">{error}</Alert>}
          {riskResult && <Alert severity={riskResult.includes('Great') || riskResult.includes('Safe') ? 'success' : 'warning'} sx={{ mt: 2 }} className={riskResult.includes('Great') || riskResult.includes('Safe') ? 'success-state' : 'error-state'}>{riskResult}</Alert>}
          {loading && <CircularProgress sx={{ mt: 2 }} className="loading-spinner" />}
        </Box>
      )}
      {tab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>Market Myths Busted</Typography>
          {myths.map((item, index) => (
            <Box key={index} sx={{ mt: 2 }} className="dashboard-card">
              <Typography variant="body1"><strong>Myth:</strong> {item.myth}</Typography>
              <Typography variant="body1"><strong>Fact:</strong> {item.fact}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default DemosAndGames;