import React, { useState, useEffect } from 'react';
import { Typography, Box, TextField, Button, CircularProgress, Alert, Table, TableBody, TableCell, TableHead, TableRow, Card, CardContent, Grid, TableContainer } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { gamificationStyles } from '../theme';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Trading() {
  const navigate = useNavigate();
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [stockData, setStockData] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [virtualBalance, setVirtualBalance] = useState(100000);
  const [aiFeedback, setAiFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sellQuantities, setSellQuantities] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        setLoading(true);
        try {
          const userDoc = doc(db, 'users', auth.currentUser.uid);
          const docSnap = await getDoc(userDoc);
          if (docSnap.exists()) {
            const data = docSnap.data();
            let userPortfolio = data.portfolio || [];
            const updatedPortfolio = await Promise.all(
              userPortfolio.map(async (stock) => {
                try {
                  const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/stock/${stock.symbol}`);
                  return { ...stock, currentPrice: response.data.price };
                } catch (err) {
                  console.error(`Error fetching price for ${stock.symbol}:`, err.message);
                  return { ...stock, currentPrice: stock.currentPrice || 0 };
                }
              })
            );
            setPortfolio(updatedPortfolio);
            setVirtualBalance(data.virtualBalance || 100000);
            await setDoc(userDoc, { portfolio: updatedPortfolio }, { merge: true });
          }
        } catch (err) {
          console.error('fetchUserData Error:', err.message);
          setError(`Error loading portfolio: ${err.message}. Please try again.`);
        }
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const fetchStockData = async () => {
    setLoading(true);
    setError('');
    try {
      const formattedSymbol = symbol.endsWith('.NS') ? symbol : `${symbol}.NS`;
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/stock/${formattedSymbol}`);
      setStockData(response.data);
    } catch (err) {
      console.error('fetchStockData Error:', err.message, err.response?.data);
      setError(`Error fetching stock data: ${err.message}. Please check the symbol.`);
      setStockData(null);
    }
    setLoading(false);
  };

  const handleBuy = async () => {
    if (!stockData || !quantity || quantity <= 0) {
      setError('Please enter a valid stock symbol and quantity.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const currentPrice = stockData.price;
      const buyQuantity = parseInt(quantity);
      const totalCost = currentPrice * buyQuantity;
      if (totalCost > virtualBalance) {
        setError('Insufficient balance.');
        setLoading(false);
        return;
      }
      const newPortfolio = [...portfolio];
      const existingStock = newPortfolio.find((stock) => stock.symbol === stockData.symbol);
      if (existingStock) {
        existingStock.quantity += buyQuantity;
        existingStock.totalCost += totalCost;
        existingStock.currentPrice = currentPrice;
      } else {
        newPortfolio.push({
          symbol: stockData.symbol,
          quantity: buyQuantity,
          totalCost,
          currentPrice,
        });
      }
      const newBalance = virtualBalance - totalCost;
      setPortfolio(newPortfolio);
      setVirtualBalance(newBalance);
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), { portfolio: newPortfolio, virtualBalance: newBalance }, { merge: true });
      }
      await fetchAiFeedback(newPortfolio);
      setQuantity('');
      setSymbol('');
      setStockData(null);
    } catch (err) {
      console.error('handleBuy Error:', err.message, err.response?.data);
      setError(`Error buying stock: ${err.message}. Please check the symbol (e.g., use HDFCBANK.NS).`);
    }
    setLoading(false);
  };

  const handleSell = async (stockSymbol, stockQuantity) => {
    setLoading(true);
    setError('');
    try {
      const formattedSymbol = stockSymbol.endsWith('.NS') ? stockSymbol : `${stockSymbol}.NS`;
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/stock/${formattedSymbol}`);
      const currentPrice = response.data.price;
      const sellQuantity = parseInt(stockQuantity);
      const existingStock = portfolio.find((stock) => stock.symbol === stockSymbol);
      if (!existingStock || sellQuantity > existingStock.quantity) {
        setError('Invalid sell quantity.');
        setLoading(false);
        return;
      }
      const totalSale = currentPrice * sellQuantity;
      const newPortfolio = portfolio
        .map((stock) =>
          stock.symbol === stockSymbol
            ? {
                ...stock,
                quantity: stock.quantity - sellQuantity,
                totalCost: stock.totalCost - (stock.totalCost / stock.quantity) * sellQuantity,
                currentPrice,
              }
            : stock
        )
        .filter((stock) => stock.quantity > 0);
      const newBalance = virtualBalance + totalSale;
      setPortfolio(newPortfolio);
      setVirtualBalance(newBalance);
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), { portfolio: newPortfolio, virtualBalance: newBalance }, { merge: true });
      }
      await fetchAiFeedback(newPortfolio);
      setSellQuantities((prev) => ({ ...prev, [stockSymbol]: '' }));
    } catch (err) {
      console.error('handleSell Error:', err.message, err.response?.data);
      setError(`Error selling stock: ${err.message}. Please check the symbol (e.g., use HDFCBANK.NS).`);
    }
    setLoading(false);
  };

  const handleAnalyzePortfolio = () => {
    if (portfolio.length === 0) {
      setError('No portfolio to analyze.');
      return;
    }
    const portfolioData = encodeURIComponent(JSON.stringify(portfolio));
    navigate(`/chatbot?portfolio=${portfolioData}`);
  };

  const fetchAiFeedback = async (currentPortfolio) => {
    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        {
          contents: [
            {
              parts: [
                {
                  text: `You are a financial advisor for beginners. Analyze this portfolio for diversification and risk: ${JSON.stringify(currentPortfolio)}. Provide a simple explanation with an analogy, in ${localStorage.getItem('language') || 'en'}. If no portfolio data is available, respond with: "No portfolio data provided. Please add stocks to your portfolio."`,
                },
              ],
            },
          ],
        },
        {
          headers: { 'Content-Type': 'application/json' },
          params: { key: process.env.REACT_APP_GEMINI_API_KEY },
        }
      );
      const feedback = response.data.candidates[0].content.parts[0].text;
      setAiFeedback(feedback);
    } catch (err) {
      console.error('fetchAiFeedback Error:', err.message);
      setAiFeedback('Error fetching AI feedback. Please try again.');
    }
  };

  const chartData = {
    labels: portfolio.map((stock) => stock.symbol),
    datasets: [
      {
        label: 'Total Value (₹)',
        data: portfolio.map((stock) => (stock.currentPrice || 0) * stock.quantity),
        backgroundColor: 'rgba(25, 118, 210, 0.6)',
        borderColor: '#1976d2',
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box sx={{ maxWidth: 1300, mx: 'auto', mt: 4, mb: 4, p: 3, boxSizing: 'border-box' }} className="glass-card neon-blue">
      <Typography variant="h4" gutterBottom className="gradient-text">Virtual Trading</Typography>
      <Typography variant="body1" sx={{ mb: 2, color: '#CBD5E0' }}>
        Balance: ₹{virtualBalance ? virtualBalance.toFixed(2) : '0.00'}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} className="error-state">{error}</Alert>}
      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* Left Column: Search & Trade, Portfolio, Value Graph */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Search & Trade */}
          <Card sx={{ ...gamificationStyles.tradingCard, p: 3, flexShrink: 0 }}>
            <Typography variant="h6" gutterBottom>Search & Trade</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Stock Symbol (e.g., RELIANCE)"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  disabled={loading}
                  fullWidth
                  sx={{ flex: '1 1 200px' }}
                />
                <TextField
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  disabled={loading}
                  fullWidth
                  sx={{ flex: '1 1 100px' }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={fetchStockData}
                  disabled={loading || !symbol}
                  className="btn-primary"
                  sx={{ flex: '0 0 auto' }}
                >
                  Search
                </Button>
              </Box>
              {loading && <CircularProgress sx={{ alignSelf: 'center' }} className="loading-spinner" />}
              {stockData && (
                <Box sx={{ mt: 2 }}>
                  <Typography>Symbol: {stockData.symbol}</Typography>
                  <Typography>Price: ₹{stockData.price ? stockData.price.toFixed(2) : 'N/A'}</Typography>
                  <Typography>Change: {stockData.change ? stockData.change.toFixed(2) : '0.00'}%</Typography>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleBuy}
                    disabled={loading}
                    sx={{ mt: 2 }}
                    className="btn-primary"
                  >
                    Buy
                  </Button>
                </Box>
              )}
            </Box>
          </Card>
          {/* Portfolio */}
          <Card sx={{ ...gamificationStyles.tradingCard, p: 3, flex: '1 1 auto', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>Portfolio</Typography>
            {portfolio.length > 0 ? (
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: '20%' }}>Symbol</TableCell>
                      <TableCell sx={{ width: '15%' }}>Quantity</TableCell>
                      <TableCell sx={{ width: '20%' }}>Current Price</TableCell>
                      <TableCell sx={{ width: '20%' }}>Total Value</TableCell>
                      <TableCell sx={{ width: '25%' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {portfolio.map((stock, index) => (
                      <TableRow key={index} className="portfolio-row">
                        <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{stock.symbol}</TableCell>
                        <TableCell>{stock.quantity}</TableCell>
                        <TableCell>₹{stock.currentPrice ? stock.currentPrice.toFixed(2) : 'N/A'}</TableCell>
                        <TableCell>₹{(stock.currentPrice ? stock.currentPrice * stock.quantity : 0).toFixed(2)}</TableCell>
                        <TableCell sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <TextField
                            type="number"
                            label="Sell Quantity"
                            size="small"
                            value={sellQuantities[stock.symbol] || ''}
                            onChange={(e) => setSellQuantities({ ...sellQuantities, [stock.symbol]: e.target.value })}
                            sx={{ width: 100 }}
                            disabled={loading}
                          />
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleSell(stock.symbol, sellQuantities[stock.symbol])}
                            disabled={loading || !sellQuantities[stock.symbol] || sellQuantities[stock.symbol] <= 0}
                            className="btn-secondary"
                          >
                            Sell
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>No stocks in portfolio.</Typography>
            )}
          </Card>
          {/* Portfolio Value Graph */}
          <Card sx={{ ...gamificationStyles.tradingCard, p: 3, flexShrink: 0 }}>
            <Typography variant="h6" gutterBottom>Portfolio Value</Typography>
            <Box sx={{ height: 250, position: 'relative' }}>
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Portfolio Value Distribution' },
                  },
                  scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Total Value (₹)' } },
                    x: { title: { display: true, text: 'Stock Symbol' } },
                  },
                }}
              />
            </Box>
          </Card>
        </Grid>
        {/* Right Column: AI Coach and Feedback */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card sx={{ ...gamificationStyles.tradingCard, p: 3, flexShrink: 0 }}>
            <Typography variant="h6" gutterBottom>AI Coach</Typography>
            <Typography variant="body1" sx={{ color: '#CBD5E0', mb: 2 }}>
              Your AI-powered trading assistant provides real-time feedback to improve your trading strategy.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAnalyzePortfolio}
              disabled={loading || portfolio.length === 0}
              fullWidth
              className="btn-primary"
            >
              Analyze Portfolio Risk
            </Button>
          </Card>
          <Card sx={{ ...gamificationStyles.tradingCard, p: 3, flex: '1 1 auto', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>AI Coach Feedback</Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap', color: '#CBD5E0' }}>
              {aiFeedback || 'No feedback yet. Make a trade to get insights!'}
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Trading;