const express = require('express');
const yahooFinance = require('yahoo-finance2').default;
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/stock/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    // Ensure symbol ends with .NS for NSE stocks
    const formattedSymbol = symbol.endsWith('.NS') ? symbol : `${symbol}.NS`;
    const quote = await yahooFinance.quote(formattedSymbol);
    if (!quote || !quote.regularMarketPrice) {
      return res.status(404).json({ error: `No data found for symbol: ${formattedSymbol}` });
    }
    res.json({
      symbol: quote.symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChangePercent,
    });
  } catch (error) {
    console.error('Error fetching stock:', error.message, error);
    res.status(500).json({ error: `Failed to fetch stock data: ${error.message}` });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));