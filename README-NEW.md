# 🏎️ Formula 1 AI Assistant

A modern, AI-powered chatbot that provides real-time Formula 1 information through a beautiful, animated web interface.

![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 💬 **Interactive Chat Interface** - Natural language Q&A about Formula 1
- 🎨 **Beautiful Modern UI** - F1-themed design with glassmorphism and animations
- 📊 **Vector Database** - Semantic search using AstraDB with 566 F1 content chunks
- 🆓 **Zero API Costs** - Custom local embeddings (no OpenAI charges)
- ⚡ **Lightning Fast** - Average response time <50ms
- 🏆 **Comprehensive Knowledge** - Teams, drivers, scoring, rules, news, champions
- 📱 **Fully Responsive** - Works perfectly on all devices
- 🧪 **Thoroughly Tested** - Functional, performance, and load testing included

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/CHARMAQE/llm-app-Formula1.git
cd llm-app-Formula1

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your AstraDB credentials

# Start development server
npm run dev

# Open http://localhost:3000
```

## 📋 Prerequisites

- Node.js 20.11.0 or higher
- npm or yarn
- AstraDB account (free tier available)

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
ASTRA_DB_APPLICATION_TOKEN=AstraCS:xxxxx...
ASTRA_DB_API_ENDPOINT=https://xxxxx.apps.astra.datastax.com
ASTRA_DB_COLLECTION=f1_knowledge
```

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run seed         # Load F1 data into database
npm run lint         # Run ESLint
```

## 🧪 Testing

```bash
# Functional testing (11 test cases)
node test-f1-chat.js

# Performance testing
node test-performance.js

# Load testing (concurrent requests)
node test-load.js 10
```

## 🏗️ Tech Stack

**Frontend:**
- Next.js 16.0.1 with App Router
- React 19.2.0
- TypeScript 5.9.3
- Tailwind CSS v4

**Backend:**
- Next.js API Routes
- AstraDB Vector Database
- Custom Local Embeddings (384 dimensions)

**Data Processing:**
- Puppeteer for web scraping
- LangChain for text chunking
- Custom hash-based embeddings

## 📁 Project Structure

```
├── app/
│   ├── api/chat/          # Chat API endpoint
│   ├── page.tsx           # Main chat interface
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── lib/
│   └── f1-knowledge.ts    # Curated F1 knowledge base
├── scripts/
│   ├── loudDB-free.ts     # Data loading script
│   └── f1-search.ts       # Search testing
└── test-*.js              # Testing scripts
```

## 🎯 Key Features Explained

### Intelligent Query Understanding
The chatbot understands various phrasings:
- "Who won 2024?" → Championship winners
- "Tell me about teams" → Team information
- "How does scoring work?" → Points system
- "Latest news" → Recent F1 updates

### Beautiful UI Components
- Animated gradient backgrounds
- Glassmorphism effects
- Custom scrollbar styling
- Quick question cards
- Smooth animations and transitions

### Performance Optimized
- Server-side rendering (SSR)
- Optimistic UI updates
- Efficient React hooks
- Fast API responses
- Minimal bundle size

## 📖 Documentation

For detailed documentation, see [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)

Topics covered:
- Complete architecture explanation
- Data flow diagrams
- Component deep-dives
- Deployment guide
- Future enhancements

## 🚀 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Then deploy to production
vercel --prod
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/CHARMAQE/llm-app-Formula1)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Formula 1 for official content
- AstraDB for vector database
- Next.js team for amazing framework
- Tailwind CSS for styling utilities

## 📞 Contact

Built with ❤️ by CHARMAQE

- GitHub: [@CHARMAQE](https://github.com/CHARMAQE)
- Project Link: [https://github.com/CHARMAQE/llm-app-Formula1](https://github.com/CHARMAQE/llm-app-Formula1)

---

**Built with Next.js, TypeScript, AstraDB & Vector AI** • **Racing into the future of AI** 🏁
