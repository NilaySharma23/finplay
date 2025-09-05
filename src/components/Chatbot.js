// src/components/Chatbot.js
import React, { useState, useEffect } from 'react';
import { Typography, Box, TextField, Button, CircularProgress, Alert, List, ListItem, ListItemText, Card, CardMedia } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { gamificationStyles } from '../theme';

function Chatbot() {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [portfolio, setPortfolio] = useState(null);

  // Keyword-to-image mapping for analogies
  const analogyImages = [
    {
      keyword: /p\/e ratio|price to earnings/i,
      image: '/images/pe-ratio.png',
      analogy: 'The P/E ratio is like the price per scoop of ice cream. A high P/E means you pay more for each scoop of profit!',
    },
    {
      keyword: /diversification|diversify/i,
      image: '/images/diversification.png',
      analogy: 'Diversification is like not putting all your eggs in one basket. Spread your investments to reduce risk!',
    },
    {
      keyword: /hedge fund|hedge funds/i,
      image: '/images/hedge-fund.png',
      analogy: 'Hedge funds are like specialized restaurants using exclusive ingredients and complex recipes to make profits, no matter the market conditions.',
    },
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
            localStorage.setItem('language', data.language || language);
            setPortfolio(data.portfolio || null);
          }
        } catch (err) {
          setError('Error loading user data. Please try again.');
          console.error('Error in fetchUserData:', err);
        }
      }
    };
    fetchUserData();
    // Check for portfolio analysis request from Trading.js
    const params = new URLSearchParams(location.search);
    const portfolioData = params.get('portfolio');
    if (portfolioData) {
      try {
        const parsedPortfolio = JSON.parse(decodeURIComponent(portfolioData));
        setPortfolio(parsedPortfolio);
        handlePortfolioAnalysis(parsedPortfolio);
      } catch (err) {
        setError('Error loading portfolio data.');
        console.error('Error parsing portfolio:', err);
      }
    }
  }, [location.search]);

  const handlePortfolioAnalysis = async (portfolioData) => {
    setLoading(true);
    setError('');
    try {
      const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const portfolioText = portfolioData
        ? `Analyze this portfolio for risk: ${JSON.stringify(portfolioData)}. Provide a simple explanation with an analogy, in ${language}.`
        : 'No portfolio data available.';
      const prompt = `You are a financial advisor for beginners. Answer the query: "${portfolioText}". Use simple language, include an analogy, and translate the response into ${language} if not English.`;
      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      const newMessage = {
        question: 'Analyze my portfolio risk',
        answer: response,
        image: analogyImages[1].image,
        analogy: analogyImages[1].analogy,
      };
      setMessages((prev) => [...prev, newMessage]);
    } catch (err) {
      setError('Error analyzing portfolio. Please try again.');
      console.error('Error in handlePortfolioAnalysis:', err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || !auth.currentUser) return;
    setLoading(true);
    setError('');
    try {
      const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are a financial advisor for beginners. Answer the query: "${query}" in simple language with an analogy. Translate the response into ${language} if not English.`;
      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      // Check for keywords to display images and extract analogy
      let image = null;
      let analogy = '';
      for (const { keyword, image: img, analogy: analog } of analogyImages) {
        if (keyword.test(query) || keyword.test(response)) {
          image = img;
          analogy = analog;
          break;
        }
      }
      // Fallback: Extract analogy from response if not predefined
      if (!analogy) {
        const analogyMatch = response.match(/like [^.!?]+[.!?]/i);
        analogy = analogyMatch ? analogyMatch[0] : '';
      }
      const newMessage = { question: query, answer: response, image, analogy };
      setMessages((prev) => [...prev, newMessage]);
      setQuery('');
    } catch (err) {
      setError('Error getting response from AI. Please try again.');
      console.error('Error in handleSubmit:', err);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, mb: 4, display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)' }} className="chat-container">
      {/* Fixed Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          background: 'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)',
          backdropFilter: 'blur(10px)',
          p: 2,
          borderBottom: '1px solid #4A5568',
        }}
      >
        <Typography variant="h4" className="gradient-text">AI Financial Buddy</Typography>
        <Typography variant="body1" sx={{ mb: 2, color: '#CBD5E0' }}>
          Ask any financial question, and I’ll explain it simply with analogies!
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }} className="error-state">{error}</Alert>}
      </Box>

      {/* Scrollable Messages */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          px: 2,
          py: 2,
          maxHeight: 'calc(100vh - 280px)', // Adjust based on header and input heights
        }}
        className="chat-messages"
      >
        <List>
          {messages.map((msg, index) => (
            <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 2 }} className="chat-message">
              <ListItemText
                primary={`You: ${msg.question}`}
                primaryTypographyProps={{ fontWeight: 'bold' }}
                sx={gamificationStyles.chatBubble.user}
              />
              <ListItemText secondary={msg.answer} sx={gamificationStyles.chatBubble.ai} />
              {msg.analogy && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Analogy:</strong> {msg.analogy}
                </Typography>
              )}
              {msg.image && (
                <Card sx={{ mt: 2, maxWidth: 300 }} className="shadow-lg">
                  <CardMedia
                    component="img"
                    height="150"
                    image={msg.image}
                    alt="Financial concept"
                    sx={{ objectFit: 'contain' }}
                  />
                </Card>
              )}
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Fixed Input Bar */}
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 2,
          background: 'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)',
          backdropFilter: 'blur(10px)',
          p: 2,
          borderTop: '1px solid #4A5568',
        }}
        className="chat-input-container"
      >
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="Ask a financial question"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            sx={{
              '& .MuiInputBase-root': { backgroundColor: '#2D3748' },
              '& .MuiInputLabel-root': { color: '#A0AEC0' },
            }}
          />
          <Button type="submit" variant="contained" color="primary" disabled={loading || !query.trim()} className="btn-primary">
            Ask
          </Button>
        </Box>
        {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 2 }} className="loading-spinner" />}
      </Box>
    </Box>
  );
}

export default Chatbot;