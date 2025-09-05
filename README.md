# FinPlay: Gamified AI-Powered Investor Education & Virtual Trading Platform

## Overview
FinPlay is a gamified, AI-powered platform designed to make financial education and stock market learning accessible, engaging, and inclusive for beginners, particularly in India. It combines interactive learning modules, AI-driven vernacular content, virtual stock trading, and competitive fantasy leagues to empower users to learn investing without financial risk. Think of it as a blend of Duolingo's gamification, Zerodha Varsity's educational content, and Dream11's competitive leagues, tailored for financial literacy.

The platform addresses key pain points for retail investors:
- **Language Barriers**: Summarizes and translates complex financial concepts into Indian languages (e.g., Hindi, Tamil, Telugu).
- **Complexity & Fear**: Simplifies learning through bite-sized lessons, analogies, and risk-free virtual trading.
- **Misinformation**: Curates reliable content from SEBI/NISM and provides AI-driven personalized feedback.
- **Engagement**: Uses gamification (streaks, badges, leaderboards) to make learning fun and habit-forming.

## Features
1. **Vernacular Smart Summarizer**:
   - Fetches educational content from SEBI/NISM/Stock Exchange sites.
   - Summarizes into concise, beginner-friendly notes with visuals/analogies.
   - Auto-translates into multiple Indian languages (Hindi, Tamil, Telugu, Bengali, Marathi, etc.).

2. **Gamified Learning Journey**:
   - Progression-based modules: Basics of Stock Market, Risk & Diversification, Algo Trading/HFT, Portfolio Building.
   - Lessons use stories, infographics, and short videos.
   - Quizzes unlock levels; streaks and badges reward consistency.

3. **Virtual Stock Fantasy League**:
   - Users start with ₹1,00,000 virtual money to trade on delayed market data (Yahoo Finance API).
   - Compete in leaderboards and fantasy leagues, similar to Dream11.
   - AI coach provides feedback (e.g., "Your portfolio is overexposed to banking—diversify into FMCG").

4. **AI Financial Buddy**:
   - Chatbot answers queries in plain/vernacular language with analogies (e.g., "P/E ratio is like price per scoop of ice cream").
   - Analyzes mock portfolios for risk and offers tailored advice.

5. **Real-World Relevance**:
   - Simplified demos on algo trading/HFT basics.
   - Risk assessment mini-games (e.g., stocks vs. bonds outcomes).
   - Push notifications for "Market Myths Busted" or daily tips.

## User Journey
1. **Discovery & Login**: Users download FinPlay, log in via Google/phone, and select their preferred language.
2. **Onboarding**: Choose experience level (Beginner/Intermediate); get ₹1,00,000 virtual money.
3. **Learning**: Progress through modules with quizzes, earning coins/badges.
4. **Trading**: Buy/sell stocks with delayed data; AI coach gives feedback.
5. **AI Buddy**: Ask questions (e.g., "What is P/E ratio?") in native language; receive visual/analogy-based answers.
6. **Leagues & Demos**: Join/create leagues, compete on leaderboards, play risk/prediction games.
7. **Progress Tracking**: Dashboard shows module completion, badges, streaks, and portfolio growth.

## Technology Stack
- **Frontend**: React.js, Material-UI, React Router, Chart.js for visualizations.
- **Backend**: Node.js with Express.js for API endpoints.
- **AI/ML**: Google Generative AI (Gemini) for summarization, translation, and chatbot.
- **APIs**: Yahoo Finance for delayed stock data; expandable to NSE APIs.
- **Database & Auth**: Firebase Firestore (user data, progress, leagues), Firebase Authentication, Firebase Storage (profile images).
- **Other**: dotenv for environment variables, CORS for API security.

## Installation
### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account (for Firestore, Auth, Storage)
- Google Generative AI API key
- Yahoo Finance API access (or alternative stock data API)

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/finplay.git
   cd finplay
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   cd backend
   npm install
   ```

3. **Set Up Environment Variables**:
   - Create a `.env` file in the root directory with the following:
     ```env
     REACT_APP_GEMINI_API_KEY=your_gemini_api_key
     REACT_APP_BACKEND_URL=http://localhost:5000
     REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
     REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
     REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
     REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
     REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
     ```
   - Create a `.env` file in the `backend` directory:
     ```env
     PORT=5000
     ```

4. **Set Up Firebase**:
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
   - Enable Authentication (Google, Phone), Firestore, and Storage.
   - Update Firestore rules:
     ```firestore
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /users/{userId} {
           allow read: if request.auth != null;
           allow write: if request.auth != null && request.auth.uid == userId;
         }
         match /leagues/{leagueId} {
           allow read, write: if request.auth != null;
         }
       }
     }
     ```
   - Add your Firebase config to `src/firebase.js`.

5. **Run the Backend**:
   ```bash
   cd backend
   npm start
   ```

6. **Run the Frontend**:
   ```bash
   cd ..
   npm start
   ```
   The app will be available at `http://localhost:3000`.

## Project Structure
```
finplay/
├── backend/
│   ├── node_modules/
│   ├── index.js           # Express server for stock data APIs
│   ├── package-lock.json
│   ├── package.json
├── public/
│   ├── images/            # Static images for analogies (e.g., pe-ratio.png)
│   ├── favicon.ico
│   ├── index.html
│   ├── manifest.json
├── src/
│   ├── components/
│   │   ├── Chatbot.js     # AI-powered financial buddy
│   │   ├── Dashboard.js   # User progress, streaks, daily challenges
│   │   ├── DemosAndGames.js # Stock charts, prediction/risk games
│   │   ├── Home.js        # Landing page with features
│   │   ├── League.js      # Fantasy leagues and leaderboards
│   │   ├── Learn.js       # Learning modules (not provided but referenced)
│   │   ├── Login.js       # User authentication
│   │   ├── Onboarding.js  # User setup (language, experience)
│   │   ├── Profile.js     # User profile management
│   │   ├── Settings.js    # Language/experience settings
│   │   ├── Trading.js     # Virtual trading interface
│   ├── App.css            # Global styles
│   ├── App.js             # Main app with routing
│   ├── firebase.js        # Firebase configuration
│   ├── index.css          # Additional CSS
│   ├── index.js           # React entry point
│   ├── theme.js           # MUI theme with gamification styles
├── .env                   # Environment variables
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
```

## Usage
1. **Login**: Sign in via Google/phone; new users are redirected to onboarding.
2. **Onboarding**: Select language (e.g., Hindi) and experience level; get virtual wallet.
3. **Dashboard**: View progress, badges, streaks, and daily challenges/tips.
4. **Learn**: Complete modules with quizzes to earn rewards.
5. **Trading**: Use virtual money to trade stocks; get AI feedback on portfolios.
6. **Chatbot**: Ask financial questions in your language; receive simplified answers.
7. **Leagues**: Create/join leagues, compete on leaderboards.
8. **Demos & Games**: Play stock prediction, risk assessment games, or view charts.

## Key Differentiators
- **Vernacular AI**: Breaks language barriers with translations and localized analogies.
- **Gamification**: Duolingo-style streaks, badges, and daily challenges keep users engaged.
- **Risk-Free Trading**: Virtual trading with delayed data and AI coaching builds confidence.
- **Social Competition**: Fantasy leagues foster community and motivation.
- **Scalable & Inclusive**: Free, cloud-based, and extensible to more languages/features.

## Current Stage
Functional MVP (Minimum Viable Product):
- Core features (dashboard, chatbot, trading, leagues, games) are implemented.
- AI integration for summarization, translation, and portfolio analysis works.
- Firebase handles user data; Yahoo Finance API provides stock data.
- Not yet polished for production or tested at scale.

## Potential Impact & Scalability
- **Impact**: Empowers 18-35-year-old Indian beginners by reducing fear, misinformation, and language barriers, potentially increasing financial literacy and market participation by 10-20% (based on edtech trends).
- **Scalability**: Cloud-based (Firebase scales automatically), low-cost AI (Gemini API), and extensible to mobile apps (React Native), more languages, or premium features (e.g., real-time data subscriptions).

## Future Enhancements
- Mobile app development with React Native.
- Integration with NSE APIs for more accurate data.
- Expanded language support and richer educational content (videos, animations).
- Premium features (e.g., advanced analytics, real-time data).
- Partnerships with financial institutions for credibility and reach.

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit changes (`git commit -m 'Add feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

## Contact
For questions or feedback, reach out via nilaysharma235@gmail.com.