```markdown
# CodeX: The Real-Time Competitive Coding Arena 🚀

![CodeX Logo](https://raw.githubusercontent.com/yourusername/codex/main/frontend/public/logo.png)

**The ultimate 1v1 competitive coding battle arena with live code sync, AI-powered judging, and real-time matchmaking.**

## ✨ Features

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

## 🛠️ Tech Stack

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

## 📦 Installation

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **Git** (for cloning the repository)
- **Docker** (optional, for containerized deployment)

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/codex.git
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

### Alternative Installation Methods

#### Using Docker (Recommended for Production)

1. **Build and run the Docker containers**:
   ```bash
   docker-compose up --build
   ```

2. **Configure environment variables** in your `.env` files within the containers

#### Development Setup

For a full development environment with all tools:
```bash
# Install all development dependencies
npm install --workspaces
pip install -r requirements-dev.txt
```

## 🎯 Usage

### Basic Usage

#### Starting a Ranked Match
```javascript
// Example of joining the ranked queue
async function joinRankedQueue() {
  const response = await fetch('/api/queue/join', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${yourAuthToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ mode: 'ranked' })
  });

  const data = await response.json();
  if (data.status === 'success') {
    console.log('Successfully joined ranked queue!');
  }
}
```

#### Submitting Code
```javascript
// Example of submitting code to the judge
async function submitCode(matchId, code, language) {
  const response = await fetch(`/api/execute`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${yourAuthToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      source_code: code,
      language: language
    })
  });

  const result = await response.json();
  return result;
}
```

#### Requesting a Hint
```javascript
// Example of requesting an AI hint
async function requestHint(matchId, userCode, executionOutput) {
  const response = await fetch(`/api/hint/${matchId}/request`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${yourAuthToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_code: userCode,
      execution_output: executionOutput
    })
  });

  const data = await response.json();
  return data.hint;
}
```

### Advanced Usage

#### Custom Problem Creation
```javascript
// Example of creating a custom problem
async function createProblem(title, description, difficulty, starterCode) {
  const response = await fetch('/api/problems/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${yourAuthToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: title,
      description: description,
      difficulty: difficulty,
      starter_code: starterCode
    })
  });

  const data = await response.json();
  return data.problemId;
}
```

#### Matchmaking Algorithm
The matchmaking system uses an ELO-based algorithm that:
1. Matches players with similar skill levels
2. Dynamically adjusts problem difficulty based on average ELO
3. Implements a robust queue system with real-time updates

```python
# Example of difficulty scaling in matchmaker.py
def _get_difficulty_for_elo(self, avg_elo):
    """Determine problem difficulty based on average ELO"""
    if avg_elo < 1100:
        return 'easy'
    elif avg_elo < 1300:
        return random.choices(['easy', 'medium'], weights=[70, 30])[0]
    # ... additional difficulty levels
```

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

## 🔧 Configuration

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

### Customization Options

1. **Problem Database**: Add or modify problems in the Supabase database
2. **Difficulty Levels**: Adjust the difficulty scaling in `matchmaker.py`
3. **UI Themes**: Customize colors in `tailwind.config.js`
4. **Match Settings**: Modify time limits and other constraints in the configuration

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute

1. **Fork the repository** and create your branch from `main`
2. **Install the development dependencies**:
   ```bash
   npm install
   cd backend
   pip install -r requirements-dev.txt
   ```
3. **Make your changes** and ensure they follow our coding standards
4. **Write tests** for your new features
5. **Submit a pull request** with a clear description of your changes

### Development Setup

1. **Set up your development environment** as described in the Installation section
2. **Run the development servers**:
   ```bash
   # Frontend
   npm run dev

   # Backend
   python app.py
   ```
3. **Make sure your changes work** by testing them thoroughly

### Code Style Guidelines

1. **Frontend**:
   - Use TypeScript for type safety
   - Follow Tailwind CSS best practices
   - Keep components modular and reusable
   - Use consistent naming conventions

2. **Backend**:
   - Follow PEP 8 style guidelines
   - Use Flask's blueprint pattern for organization
   - Write comprehensive docstrings
   - Use Python type hints where appropriate

3. **General**:
   - Write clear, concise commit messages
   - Follow the project's existing code patterns
   - Add tests for new functionality
   - Keep pull requests focused on single features

### Pull Request Process

1. **Ensure your code passes all tests**
2. **Update documentation** if your changes affect the API or user experience
3. **Follow the project's contribution guidelines**
4. **Submit your pull request** with a clear description of what you changed

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 👥 Authors & Contributors

**Core Team**:
- [Prajyot Borikar](https://github.com/prajyotborikar) - Lead Developer
- [Pranav Ratnalikar](https://github.com/PranavPRatnalikar) - Backend Engineer
- [Ashish Jha](https://github.com/ashishjha1034) - Frontend Engineer

**Special Thanks**:
- [Supabase](https://supabase.com/) - For the amazing database platform
- [Judge0](https://judge0.com/) - For the code execution API
- [Google AI](https://ai.google/) - For the powerful AI services

## 🐛 Issues & Support

### Reporting Issues

If you encounter any problems or have feature requests:
1. **Search existing issues** to avoid duplicates
2. **Create a new issue** with:
   - A clear description of the problem
   - Steps to reproduce
   - Any relevant error messages
   - Your environment details

### Getting Help

- **Join our community** on Discord or GitHub Discussions
- **Ask questions** on Stack Overflow with the `codex` tag
- **Check our documentation** for answers to common questions

### FAQ

**Q: How do I get started?**
A: Follow the Installation section to set up the project locally.

**Q: Can I contribute to the project?**
A: Absolutely! Check out the Contributing section for details.

**Q: How does the matchmaking work?**
A: The system uses an ELO-based algorithm to match players of similar skill levels. See the matchmaker.py file for details.

**Q: What languages are supported?**
A: Currently, we support Python, JavaScript, Java, and C++. More languages can be added through the Judge0 API.

**Q: How do I add a new problem?**
A: Add the problem details to your Supabase database and update the problem selection logic in the frontend.

## 🗺️ Roadmap

### Planned Features

1. **Multiplayer Support**: Add support for more than 2 players
2. **Spectator Mode**: Allow users to watch matches
3. **Team Battles**: Implement team-based matches
4. **More Languages**: Add additional programming language support
5. **Advanced Analytics**: Provide detailed match statistics
6. **Mobile App**: Develop a native mobile application
7. **Community Challenges**: Add public problem sets

### Known Issues

- **Hint Service**: The AI hint service may occasionally return incomplete responses
- **Code Execution**: Some edge cases in code execution need additional handling
- **UI Responsiveness**: Further improvements needed for mobile devices

### Future Improvements

1. **Performance Optimization**: Reduce latency in real-time updates
2. **Enhanced Security**: Add more robust authentication and authorization
3. **Better Error Handling**: Improve user feedback for errors
4. **Localization**: Add support for multiple languages
5. **Accessibility**: Improve accessibility for users with disabilities

## 🚀 Getting Started

Ready to dive in? Here's how to get started:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/codex.git
   cd codex
   ```

2. **Set up your environment**:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   pip install -r requirements.txt
   ```

3. **Configure your environment**:
   Create `.env` files with your API keys and credentials

4. **Run the application**:
   ```bash
   # In one terminal
   cd frontend
   npm run dev

   # In another terminal
   cd ../backend
   python app.py
   ```

5. **Start coding!** Open your browser to `http://localhost:5173` and begin your competitive coding journey.

## 🌟 Star and Contribute

We'd love for you to star this repository and contribute to its growth! Whether you're fixing bugs, adding features, or improving documentation, your contributions are welcome.

💡 **Pro Tip**: Check out the [Contributing](https://github.com/yourusername/codex/blob/main/CONTRIBUTING.md) guide for more details on how to get involved.

Let's build the future of competitive coding together! 🚀
```

This README.md provides a comprehensive overview of the CodeX project with:

1. An engaging introduction with a clear value proposition
2. Detailed feature list with emojis for visual appeal
3. Technical stack breakdown
4. Step-by-step installation instructions
5. Practical usage examples with code snippets
6. Clear project structure visualisation
7. Configuration details
8. Comprehensive contributing guidelines
9. License information
10. Roadmap and plans
11. Support information
12. Getting started guide

The README follows modern GitHub best practices, including:
- Clear section organisation
- Code formatting for readability
- Visual elements like emojis and code blocks
- Practical examples that developers can use immediately
- Encouragement for contributions
- Professional tone that attracts potential contributors

The content is tailored to the actual codebase while maintaining a positive, inviting tone that encourages engagement with the project.
