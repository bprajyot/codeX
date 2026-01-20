# CodeX: The Real-Time Competitive Coding Arena
The ultimate 1v1 competitive coding battle arena with live code sync, AI-powered judging, and real-time matchmaking.

---

## Features
✅ **Real-Time 1v1 Battles** – Compete head-to-head in live coding matches
✅ **AI-Powered Judging** – Instant execution and automated scoring
✅ **Multiple Game Modes** – Ranked, Casual, Custom, and Practice modes
✅ **AI Code Detection** – Advanced plagiarism detection system
✅ **Contextual Hints** – Get AI-generated hints to guide your coding
✅ **ELO Rating System** – Track your progress and climb the leaderboards
✅ **Problem Difficulty Scaling** – Challenges adapt to your skill level
✅ **Real-Time Collaboration** – Watch your opponent's code in real-time
✅ **Cross-Platform Support** – Works on any modern browser
✅ **Responsive Design** – Optimized for all screen sizes

---

## Tech Stack

### Frontend
- **Framework**: React 19.2.0
- **Styling**: Tailwind CSS 3.4.18
- **Editor**: Monaco Editor (VS Code-like)
- **State Management**: React Context API
- **Real-Time Updates**: Supabase Realtime
- **Authentication**: Supabase Auth
- **API Client**: Custom Fetch wrapper
- **Build Tool**: Vite

### Backend
- **Framework**: Flask 2.3.2
- **Database**: Supabase PostgreSQL
- **Code Execution**: Judge0 API
- **AI Services**: Google Generative AI (Gemini)
- **Task Scheduling**: APScheduler
- **Authentication**: JWT with Supabase
- **Rate Limiting**: Custom implementation

### Additional Tools
- **Language Support**: Python, JavaScript, Java, C++
- **Problem Database**: Custom problem set
- **Matchmaking System**: Custom ELO-based algorithm
- **Code Analysis**: Custom AI detection system

---

## Installation

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **Git** (for cloning the repository)
- **Docker** (optional, for containerized deployment)

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/bprajyot/codeX.git
   cd codex
   ```

2. **Set up environment variables**:
   Create a `.env` file in the `backend` directory with the following variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   SUPABASE_JWT_SECRET=your_jwt_secret
   JUDGE0_API_KEY=your_judge0_api_key
   GOOGLE_API_KEY=your_google_api_key
   FLASK_SECRET_KEY=your_flask_secret_key
   ```

3. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

4. **Install backend dependencies**:
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

5. **Set up Supabase**:
   - Create a Supabase project and database
   - Configure the tables as defined in the project
   - Update your `.env` file with the correct credentials

6. **Run the development servers**:
   ```bash
   # In one terminal (frontend)
   npm run dev

   # In another terminal (backend)
   python app.py
   ```

---

#### Development Setup

For a full development environment with all tools:
```bash
# Install all development dependencies
npm install --workspaces
pip install -r requirements-dev.txt
```

---

## 📁 Project Structure

```
codex/
├── backend/                  # Backend server
│   ├── app.py                # Main Flask application
│   ├── config.py             # Configuration settings
│   ├── judge0.py             # Code execution handler
│   ├── matchmaker.py         # Matchmaking algorithm
│   ├── routes/               # API routes
│   │   ├── auth.py           # Authentication routes
│   │   ├── execute.py        # Code execution routes
│   │   ├── hints.py          # Hint generation routes
│   │   ├── match.py          # Match management routes
│   │   ├── practice.py       # Practice mode routes
│   │   └── queue.py          # Matchmaking queue routes
│   ├── services/             # Business logic services
│   │   ├── ai_detector.py    # AI code detection
│   │   └── hint_service.py   # Hint generation service
│   ├── utils/                # Utility functions
│   │   ├── errors.py         # Error handling
│   │   └── validators.py     # Request validation
│   ├── requirements.txt      # Python dependencies
│   └── .env                  # Environment variables
│
├── frontend/                 # Frontend application
│   ├── public/               # Static assets
│   ├── src/                  # Source code
│   │   ├── components/       # Reusable components
│   │   │   ├── Button.jsx    # Button component
│   │   │   ├── EditorWindow.jsx # Code editor
│   │   │   ├── HintPanel.jsx # Hint panel
│   │   │   └── ...           # Other components
│   │   ├── context/          # React context providers
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utility libraries
│   │   ├── pages/            # Page components
│   │   │   ├── Arena.jsx     # Match arena
│   │   │   ├── Auth.jsx      # Authentication
│   │   │   ├── Dashboard.jsx  # Main dashboard
│   │   │   └── ...           # Other pages
│   │   ├── App.jsx           # Main application
│   │   └── main.jsx          # Entry point
│   ├── package.json          # Node dependencies
│   ├── vite.config.js        # Vite configuration
│   └── tailwind.config.js    # Tailwind configuration
│
├── .gitignore                # Git ignore rules
├── README.md                 # This file
└── ...
```

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_key
SUPABASE_JWT_SECRET=your_jwt_secret_key

# Judge0 Configuration
JUDGE0_API_KEY=your_judge0_api_key
JUDGE0_HOST=judge0-ce.p.rapidapi.com

# Google AI Configuration
GOOGLE_API_KEY=your_google_api_key

# Application Configuration
FLASK_SECRET_KEY=your_flask_secret_key
FLASK_ENV=development
MATCHMAKER_INTERVAL=10
CASUAL_HINT_LIMIT=3
HINT_COOLDOWN_SECONDS=10
```
