import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Box, Button, CircularProgress, Alert, RadioGroup, FormControl, FormControlLabel, Radio } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

function Learn() {
  const { moduleId } = useParams(); // Get module ID from URL
  const navigate = useNavigate();
  const language = localStorage.getItem('language') || 'en';
  const [module, setModule] = useState(moduleId || 'basics');
  const [chapterIndex, setChapterIndex] = useState(0);
  const [summary, setSummary] = useState('');
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ basics: 0, risk: 0, algo: 0, portfolio: 0 });
  const [badges, setBadges] = useState([]);
  const [chapterProgress, setChapterProgress] = useState({
    basics: [false, false, false, false, false],
    risk: [false, false, false, false, false],
    algo: [false, false, false, false, false],
    portfolio: [false, false, false, false, false],
  });

  // Lesson content (5 chapters per module)
  const lessonContent = {
    basics: [
      {
        title: 'What is a Stock?',
        story: 'Ravi loves pizza and hears about Pizza Palace going public. He buys a share, meaning he owns a tiny slice of the company. If Pizza Palace grows, his share value rises, but if they burn their pizzas, it might fall.',
        quiz: {
          question: 'What does owning a stock mean?',
          options: ['Lending money', 'Owning a part of a company', 'Buying the whole company', 'Renting assets'],
          correctAnswer: 'Owning a part of a company',
        },
      },
      {
        title: 'Bull vs. Bear Markets',
        story: 'Ravi sees Pizza Palace’s shares soar when everyone’s buying—this is a bull market, like a charging bull lifting prices. When bad news hits and prices drop, it’s a bear market, like a bear hibernating.',
        quiz: {
          question: 'What is a bull market?',
          options: ['Falling prices', 'Rising prices', 'Stable prices', 'No trading'],
          correctAnswer: 'Rising prices',
        },
      },
      {
        title: 'Stock Exchanges',
        story: 'Ravi learns he buys shares on a stock exchange, like a marketplace where people trade company slices. In India, NSE and BSE are the big markets, regulated by SEBI to keep things fair.',
        quiz: {
          question: 'What is a stock exchange?',
          options: ['A bank', 'A trading marketplace', 'A government office', 'A company'],
          correctAnswer: 'A trading marketplace',
        },
      },
      {
        title: 'Indices like Nifty',
        story: 'Ravi hears about Nifty, a number showing how top companies are doing. It’s like a report card for the market—if Nifty rises, the market is happy!',
        quiz: {
          question: 'What does the Nifty index represent?',
          options: ['A single stock', 'Top companies’ performance', 'Government bonds', 'Bank rates'],
          correctAnswer: 'Top companies’ performance',
        },
      },
      {
        title: 'Demat Account',
        story: 'Ravi needs a demat account to store his shares, like a digital wallet for stocks. He opens one with a broker and becomes KYC-compliant to start trading.',
        quiz: {
          question: 'What is a demat account used for?',
          options: ['Saving money', 'Storing shares digitally', 'Paying taxes', 'Buying bonds'],
          correctAnswer: 'Storing shares digitally',
        },
      },
    ],
    risk: [
      {
        title: 'What is Risk?',
        story: 'Priya invests in a tech stock, but a market crash cuts its value. She learns this is market risk, like betting on a rainy day without an umbrella.',
        quiz: {
          question: 'What is market risk?',
          options: ['Guaranteed profit', 'Price fluctuations', 'Fixed returns', 'No trading'],
          correctAnswer: 'Price fluctuations',
        },
      },
      {
        title: 'Diversification',
        story: 'Priya spreads her money across tech, banks, and FMCG, like not putting all eggs in one basket. This lowers her risk if one sector crashes.',
        quiz: {
          question: 'How does diversification help?',
          options: ['Guarantees profits', 'Reduces risk', 'Increases risk', 'Stops trading'],
          correctAnswer: 'Reduces risk',
        },
      },
      {
        title: 'Credit Risk',
        story: 'Priya buys a bond, but the company might not pay back. This is credit risk, like lending money to a friend who might not return it.',
        quiz: {
          question: 'What is credit risk?',
          options: ['Market crash', 'Company defaulting', 'High profits', 'Low liquidity'],
          correctAnswer: 'Company defaulting',
        },
      },
      {
        title: 'Liquidity Risk',
        story: 'Priya wants to sell a stock but finds no buyers. This is liquidity risk, like trying to sell a rare collectible when no one’s interested.',
        quiz: {
          question: 'What is liquidity risk?',
          options: ['Price drop', 'No buyers/sellers', 'High returns', 'Tax issues'],
          correctAnswer: 'No buyers/sellers',
        },
      },
      {
        title: 'Risk Appetite',
        story: 'Priya learns she’s cautious, so she picks safer investments. Knowing her risk appetite is like choosing a spicy or mild dish based on taste.',
        quiz: {
          question: 'What is risk appetite?',
          options: ['Investment amount', 'Willingness to take risk', 'Market size', 'Stock price'],
          correctAnswer: 'Willingness to take risk',
        },
      },
    ],
    algo: [
      {
        title: 'What is Algo Trading?',
        story: 'Amit uses a computer program to buy stocks fast when prices dip, like a robot chef flipping pizzas perfectly. This is algo trading, but wrong rules can mess up.',
        quiz: {
          question: 'What does algo trading use?',
          options: ['Human brokers', 'Computer rules', 'Random guesses', 'News articles'],
          correctAnswer: 'Computer rules',
        },
      },
      {
        title: 'Speed in Algo Trading',
        story: 'Amit’s algo buys stocks in milliseconds, like a sprinter beating others to the finish line. Speed helps grab opportunities, but crashes can hurt.',
        quiz: {
          question: 'What is a key benefit of algo trading?',
          options: ['Guaranteed profits', 'Speed', 'No risk', 'Manual control'],
          correctAnswer: 'Speed',
        },
      },
      {
        title: 'SEBI Regulations',
        story: 'Amit learns SEBI checks all algo trades to keep markets fair, like a referee in a game. Brokers must approve algos before use.',
        quiz: {
          question: 'Who regulates algo trading in India?',
          options: ['RBI', 'SEBI', 'NSE', 'IRDAI'],
          correctAnswer: 'SEBI',
        },
      },
      {
        title: 'Risks of Algo Trading',
        story: 'Amit’s algo fails when the system crashes, like a robot chef burning pizzas. This is system risk in algo trading.',
        quiz: {
          question: 'What is a risk of algo trading?',
          options: ['System failure', 'High profits', 'Slow trading', 'No regulation'],
          correctAnswer: 'System failure',
        },
      },
      {
        title: 'HFT Basics',
        story: 'Amit hears of HFT, where super-fast computers trade thousands of times a second, like a hyper-speed pizza delivery. It’s a type of algo trading.',
        quiz: {
          question: 'What is HFT?',
          options: ['Manual trading', 'High-frequency trading', 'Long-term investing', 'Bond trading'],
          correctAnswer: 'High-frequency trading',
        },
      },
    ],
    portfolio: [
      {
        title: 'What is a Portfolio?',
        story: 'Sneha mixes stocks, bonds, and mutual funds, like a chef balancing spicy and mild flavors in a dish. This mix is her portfolio.',
        quiz: {
          question: 'What is a portfolio?',
          options: ['A single stock', 'Mix of assets', 'A bank account', 'A loan'],
          correctAnswer: 'Mix of assets',
        },
      },
      {
        title: 'Asset Allocation',
        story: 'Sneha splits her money: 50% stocks, 30% bonds, 20% mutual funds, like dividing a budget for food, rent, and fun. This is asset allocation.',
        quiz: {
          question: 'What is asset allocation?',
          options: ['Buying one stock', 'Splitting investments', 'Selling all assets', 'Avoiding risk'],
          correctAnswer: 'Splitting investments',
        },
      },
      {
        title: 'Rebalancing',
        story: 'Sneha’s stocks grow too much, unbalancing her portfolio. She sells some to restore her mix, like trimming overgrown plants.',
        quiz: {
          question: 'What is rebalancing?',
          options: ['Buying more stocks', 'Restoring asset mix', 'Stopping investments', 'Taking loans'],
          correctAnswer: 'Restoring asset mix',
        },
      },
      {
        title: 'Diversified Portfolio',
        story: 'Sneha picks stocks from tech, banks, and FMCG, like choosing different cuisines to reduce risk. This is a diversified portfolio.',
        quiz: {
          question: 'What does a diversified portfolio reduce?',
          options: ['Profits', 'Risk', 'Taxes', 'Trading'],
          correctAnswer: 'Risk',
        },
      },
      {
        title: 'Monitoring Portfolio',
        story: 'Sneha checks her portfolio monthly, like a chef tasting soup to adjust flavors. This helps her stay on track.',
        quiz: {
          question: 'Why monitor a portfolio?',
          options: ['To pay taxes', 'To stay on track', 'To stop investing', 'To buy bonds'],
          correctAnswer: 'To stay on track',
        },
      },
    ],
  };

  // SEBI Summarizer content (from Gap 1)
  const topicContent = {
    basics: `Stock market allows buying/selling shares. Stocks represent ownership in companies. SEBI regulates to protect investors...`,
    risk: `Risk in investing includes market risk, credit risk, liquidity risk...`,
    algo: `SEBI guidelines for algorithmic trading (2022 updates) regulate retail use...`,
    portfolio: `Diversification reduces risk by spreading investments across assets...`,
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = doc(db, 'users', auth.currentUser.uid);
          const docSnap = await getDoc(userDoc);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProgress(data.progress || progress);
            setBadges(data.badges || []);
            setChapterProgress(data.chapterProgress || chapterProgress);
          }
        } catch (error) {
          setQuizFeedback('Error loading progress. Try again.');
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  // Summarize SEBI content
  const summarizeAndTranslate = useCallback(async () => {
    setLoading(true);
    const content = topicContent[module] || 'No content available for this topic.';
    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        {
          contents: [
            {
              parts: [
                {
                  text: `Summarize the following content in 2-3 sentences as bite-sized notes, using simple explanations and analogies if possible, and translate the summary into ${language === 'hi' ? 'Hindi' : language === 'ta' ? 'Tamil' : language === 'te' ? 'Telugu' : language === 'bn' ? 'Bengali' : language === 'mr' ? 'Marathi' : 'English'}: ${content}`,
                },
              ],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            key: process.env.REACT_APP_GEMINI_API_KEY,
          },
        }
      );
      setSummary(response.data.candidates[0].content.parts[0].text);
    } catch (error) {
      console.error('Error with Gemini API:', error);
      setSummary('Error fetching summary. Please try again.');
    }
    setLoading(false);
  }, [language, module]);

  useEffect(() => {
    summarizeAndTranslate();
    // Ensure module matches URL param
    if (moduleId && module !== moduleId) {
      setModule(moduleId);
      setChapterIndex(0);
      setQuizAnswer('');
      setQuizSubmitted(false);
    }
  }, [moduleId, module, summarizeAndTranslate]);

  // Handle quiz submission
  const handleQuizSubmit = async () => {
    const currentChapter = lessonContent[module][chapterIndex];
    const isCorrect = quizAnswer === currentChapter.quiz.correctAnswer;
    setQuizSubmitted(true);
    setQuizFeedback(isCorrect ? 'Correct! Progress updated.' : 'Incorrect. Try again!');

    if (isCorrect) {
      try {
        const newChapterProgress = { ...chapterProgress };
        newChapterProgress[module][chapterIndex] = true;
        const newProgress = {
          ...progress,
          [module]: Math.min(progress[module] + 20, 100), // 20% per chapter
        };
        setChapterProgress(newChapterProgress);
        setProgress(newProgress);
        if (auth.currentUser) {
          const userDoc = doc(db, 'users', auth.currentUser.uid);
          const badge = {
            basics: 'Market Starter',
            risk: 'Risk Warrior',
            algo: 'Algo Explorer',
            portfolio: 'Portfolio Champ',
          }[module];
          const newBadges = newProgress[module] === 100 && !badges.includes(badge) ? [...badges, badge] : badges;
          await setDoc(userDoc, { progress: newProgress, badges: newBadges, chapterProgress: newChapterProgress }, { merge: true });
          setBadges(newBadges);
        }
        // Move to next chapter if available
        if (chapterIndex < lessonContent[module].length - 1) {
          setChapterIndex(chapterIndex + 1);
          setQuizAnswer('');
          setQuizSubmitted(false);
        }
      } catch (error) {
        setQuizFeedback('Error saving progress. Try again.');
      }
    }
  };

  // Check if chapter is unlocked
  const isChapterUnlocked = (index) => {
    if (index === 0) return true;
    return chapterProgress[module][index - 1];
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Learn: {module === 'basics' ? 'Basics of Stock Market' : module === 'risk' ? 'Risk & Diversification' : module === 'algo' ? 'Intro to Algo Trading / HFT' : 'Portfolio Building'}</Typography>
      <Button variant="outlined" onClick={() => navigate('/dashboard')} sx={{ mb: 2 }}>Back to Dashboard</Button>
      
      {/* Chapter Navigation */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {lessonContent[module].map((_, index) => (
          <Button
            key={index}
            variant={chapterIndex === index ? 'contained' : 'outlined'}
            onClick={() => isChapterUnlocked(index) && setChapterIndex(index)}
            disabled={!isChapterUnlocked(index)}
          >
            Chapter {index + 1}
          </Button>
        ))}
      </Box>

      {/* Chapter Content */}
      {lessonContent[module][chapterIndex] && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h5">Chapter {chapterIndex + 1}: {lessonContent[module][chapterIndex].title}</Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>Story</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {lessonContent[module][chapterIndex].story}
          </Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>Quiz</Typography>
          {quizSubmitted ? (
            <Box>
              <Typography variant="body1">{quizFeedback}</Typography>
              {quizAnswer !== lessonContent[module][chapterIndex].quiz.correctAnswer && (
                <Button variant="contained" color="primary" onClick={() => { setQuizAnswer(''); setQuizSubmitted(false); }} sx={{ mt: 2 }}>
                  Retry Quiz
                </Button>
              )}
            </Box>
          ) : (
            <Box>
              <Typography variant="body1">{lessonContent[module][chapterIndex].quiz.question}</Typography>
              <FormControl component="fieldset">
                <RadioGroup value={quizAnswer} onChange={(e) => setQuizAnswer(e.target.value)}>
                  {lessonContent[module][chapterIndex].quiz.options.map((option, index) => (
                    <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
                  ))}
                </RadioGroup>
              </FormControl>
              <Button variant="contained" color="primary" onClick={handleQuizSubmit} disabled={!quizAnswer} sx={{ mt: 2 }}>
                Submit Answer
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Summarizer Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>SEBI/NISM Summary</Typography>
        <Typography variant="body1" gutterBottom>
          Summarized content for {module} in {language.toUpperCase()}.
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
            {summary}
          </Typography>
        )}
        <Button variant="contained" color="primary" onClick={summarizeAndTranslate} sx={{ mt: 2 }}>
          Refresh Summary
        </Button>
      </Box>
    </Box>
  );
}

export default Learn; 