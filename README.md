# VibeSpace - Personality-Driven Interior E-Commerce Platform

**Make Space Feel Like You.**

VibeSpace is a full-stack MERN application that revolutionizes furniture shopping by understanding your design personality first. Instead of overwhelming users with product catalogs, VibeSpace classifies aesthetic preferences through a visual quiz, then curates everything around that identity.

## 🎯 Key Features

- **25-Question Visual Quiz** - Discover your design aesthetic through revealed preferences
- **AI-Powered Style Classification** - Weighted scoring algorithm generates hybrid labels like "Warm Minimalist" or "Boho-Industrial Fusion"
- **Multi-User Mode** - Couples and roommates can merge preferences with weighted aggregation
- **Personalized Mood Boards** - Dynamic generation from database queries with regeneration
- **Smart Recommendation Engine** - Tag-matching with match scoring (0-13 scale)
- **AI Product Tagging** - OpenAI-powered enrichment of Kaggle furniture dataset

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)
```
server/
├── models/          # 8 Mongoose schemas
├── controllers/     # Business logic (auth, quiz, profile, products)
├── routes/          # REST API endpoints
├── middleware/      # Auth, validation, error handling
├── utils/           # Scoring, merging, recommendations
└── config/          # DB connection, constants
```

### Frontend (React + Vite + Tailwind CSS)
```
client/src/
├── components/      # Reusable UI (20+ components)
├── pages/           # 7 main pages
├── context/         # Auth & Profile state management
├── services/        # Axios API layer
└── utils/           # Constants, helpers
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- OpenAI API key (for product tagging)

### 1. Clone & Install
```bash
git clone <repo-url>
cd VibeSpace

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Setup

**Backend** (`server/.env`):
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/vibespace
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=sk-your-openai-api-key
```

**Frontend** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Tag Products (One-Time Setup)

```bash
cd scripts
pip install -r requirements.txt

# Download Kaggle furniture dataset first, then:
python tag_products.py amazon_furniture.csv
```

This generates `amazon_furniture_tagged.csv` with AI-assigned style/color/material tags.

### 4. Import Data to MongoDB

```bash
# Convert CSV to JSON
python -c "
import pandas as pd, ast
df = pd.read_csv('amazon_furniture_tagged.csv')
df['style_tags'] = df['style_tags'].apply(ast.literal_eval)
df.to_json('products.json', orient='records', indent=2)
"

# Import to MongoDB
mongoimport --uri="your_mongo_uri" --collection=products --file=products.json --jsonArray
```

### 5. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Visit `http://localhost:5173`

## 📊 Database Schema

- **Users** - Auth, mode (single/group), quiz completion status
- **Groups** - Multi-user mode with weighted preferences
- **QuizQuestions** - 25 questions with 4 image options each
- **UserResponses** - Quiz submissions
- **UserStyleProfile** - Individual aesthetic profiles
- **GroupStyleProfile** - Merged group profiles
- **Products** - Furniture catalog with AI tags
- **Assets** - Mood board images (room inspiration, textures)

## 🎨 Design System

- **Primary Color**: `#5B4FCF` (Deep Violet)
- **Accent Color**: `#E8845A` (Terracotta)
- **Background**: `#F5F0EB` (Warm Off-White)
- **Display Font**: Playfair Display
- **Body Font**: Inter

## 🧮 Core Algorithms

### Quiz Scoring
```javascript
styleScore[selectedStyle] += 2
colorScore[selectedColor] += 1
materialScore[selectedMaterial] += 1
```

### Hybrid Label Generation
```javascript
if (topTwoStylesWithin5Points) {
  label = "Minimalist-Scandinavian Fusion"
} else {
  label = "Warm Minimalist" // adjective + style
}
```

### Multi-User Merge
```javascript
finalScore[style] = Σ(userScore[style] × weight)
// weights sum to 1.0
```

### Product Match Scoring
```javascript
score = 0
if (primaryStyleMatch) score += 5
if (secondaryStyleMatch) score += 3
if (colorMatch) score += 3
if (materialMatch) score += 2
// max score: 13
```

## 📁 API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Quiz
- `GET /api/quiz/questions` - Fetch all questions
- `POST /api/quiz/submit` - Submit responses & generate profile

### Profile
- `GET /api/profile/me` - Get style profile
- `POST /api/profile/merge` - Merge group profiles
- `PUT /api/profile/toggle` - Toggle personalization

### Products
- `GET /api/products` - Personalized feed
- `GET /api/products/:id` - Single product
- `GET /api/products/search` - Search with filters

### Mood Board
- `GET /api/moodboard/generate` - Create mood board
- `POST /api/moodboard/regenerate` - Shuffle pool

## 🎯 Placement Interview Talking Points

1. **Recommendation Engine**: "We use tag-matching with weighted scoring, similar to how Netflix ranks content per user profile, but for furniture."

2. **Multi-User Merge**: "Couples have conflicting tastes. We solve this with weighted linear combination of style vectors—like collaborative filtering but deterministic."

3. **AI Data Enrichment**: "The Kaggle dataset had no style metadata. We built a pipeline that sends product descriptions to GPT-4o-mini and gets back JSON arrays of style tags. Real-world data enrichment pattern."

4. **Revealed Preferences**: "Users don't know what 'Scandinavian' means. Our quiz captures revealed preferences through visual reactions, not stated preferences."

5. **Hybrid Labels**: "Most people don't fit one bucket. If top two styles are within 5 points, we generate fusion labels. Feels honest and builds trust."

## 🔮 Roadmap

- **Room Scanner** - Upload photo, detect current style, recommend complementary products
- **Shop the Look** - Click inspiration image, see exact products used
- **Collaborative Filtering** - "Users with your aesthetic also saved..."
- **Cosine Similarity** - Upgrade from tag-matching to vector similarity
- **Vector Database** - Move to Pinecone for fast nearest-neighbor lookup

## 📄 License

MIT

## 👥 Team

Built for placement demonstration - showcasing full-stack architecture, recommendation systems, and AI integration.

---

**VibeSpace** - Where personality meets interior design. 🏠✨

redeploy dddds sadfs

<!-- Last updated: 2026-03-13 -->

