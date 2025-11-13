# 🏎️ F1 AI Assistant - Quick Reference Guide

## 🚀 Common Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Check code quality

# Data Management
ts-node scripts/loudDB-free.ts      # Load F1 data (566 chunks)
ts-node scripts/f1-search.ts        # Test search functionality

# Testing
node test-f1-chat.js                # Run functional tests (11 cases)
node test-performance.js            # Check response times
node test-load.js 10                # Load test (10 concurrent users)

# Git
git status                          # Check changes
git add .                           # Stage all changes
git commit -m "message"             # Commit changes
git push origin main                # Push to GitHub
```

## 📁 Key Files Quick Access

| File | Purpose | Lines |
|------|---------|-------|
| `app/page.tsx` | Main chat UI interface | ~320 |
| `app/api/chat/route.ts` | Chat API endpoint | ~30 |
| `lib/f1-knowledge.ts` | Knowledge base | ~150 |
| `app/globals.css` | Styles & animations | ~50 |
| `scripts/loudDB-free.ts` | Data loader | ~200 |
| `tailwind.config.js` | CSS config | ~35 |

## 🎯 Quick Testing Queries

**Copy-paste these into the chat:**

```
Who won the 2024 F1 championship?
Tell me about Red Bull Racing
Who are the current F1 drivers?
How does F1 scoring work?
What are the technical regulations?
What's the latest F1 news?
Explain the points system
Tell me about Max Verstappen
```

## 🔧 Environment Variables

```env
# AstraDB (Required)
ASTRA_DB_APPLICATION_TOKEN=AstraCS:xxxxx
ASTRA_DB_API_ENDPOINT=https://xxxxx.apps.astra.datastax.com
ASTRA_DB_COLLECTION=f1_knowledge

# Optional
NODE_ENV=development
PORT=3000
```

## 📊 Project Stats

- **Total Files:** ~50
- **Code Lines:** ~2,000
- **Dependencies:** 18
- **Test Cases:** 11
- **Database Chunks:** 566
- **Vector Dimensions:** 384
- **API Endpoints:** 1
- **Response Time:** <50ms

## 🎨 UI Color Palette

```
Primary Red:     #dc2626  (red-600)
Accent Orange:   #ea580c  (orange-600)
Background Dark: #0f172a  (slate-950)
Accent Red:      #7f1d1d  (red-950)
Text Light:      #f8fafc  (slate-50)
Text Gray:       #94a3b8  (slate-400)
Border:          #991b1b  (red-900)
Glow:            #dc2626  (red-600/50)
```

## 🏗️ Architecture Summary

```
USER → React UI → Next.js API → Knowledge Base → Response
                              ↓
                        AstraDB (backup)
```

## 📝 Knowledge Base Categories

1. **Champions** - Winners & history
2. **Teams** - 10 F1 teams + drivers  
3. **Drivers** - Notable racers & stats
4. **Scoring** - Points system (25-18-15-12-10-8-6-4-2-1)
5. **Rules** - Technical regulations
6. **News** - Latest F1 updates

## 🔍 Query Matching Keywords

| Query Contains | Returns |
|----------------|---------|
| "who won", "winner", "champion" + year | Champions |
| "news", "latest", "recent", "update" | News |
| "team", "constructor" | Teams |
| "driver", "pilot", "racer" | Drivers |
| "point", "score", "scoring" | Scoring |
| "rule", "regulation", "technical" | Rules |
| (default) | News |

## 🧪 Test Results Interpretation

### Functional Tests
```
✅ PASSED - Response contains expected keywords
⚠️  WARNING - Response ok but missing some keywords
❌ FAILED - No response or error
```

### Performance Tests
```
<500ms   = ⚡ Excellent
500-1000ms = ✅ Good
1-2s     = ⚠️  Acceptable
>2s      = ❌ Slow (needs optimization)
```

### Load Tests
```
0 failures        = ✅ Perfect
<10% failures     = ⚠️  Mostly stable
≥10% failures     = ❌ System struggling
```

## 🐛 Common Issues & Fixes

### Issue: Port 3000 already in use
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Issue: CSS not loading
```bash
rm -rf .next
npm run dev
```

### Issue: Database connection error
```bash
# Check .env file
cat .env

# Verify credentials in AstraDB dashboard
# Make sure token has read/write permissions
```

### Issue: Old page showing after changes
```bash
# Hard refresh browser
Cmd + Shift + R (Mac)
Ctrl + Shift + R (Windows)

# Or restart server
Cmd/Ctrl + C
npm run dev
```

## 📦 Dependencies Explained

### Production
```
next              Framework
react             UI library
react-dom         React rendering
@datastax/astra-db-ts  Database client
puppeteer         Web scraping
langchain         Text processing
dotenv            Environment variables
```

### Development
```
typescript        Type safety
tailwindcss       CSS framework
@tailwindcss/postcss  PostCSS integration
ts-node           TS execution
eslint            Code linting
```

## 🎯 Success Metrics

✅ **Working if you see:**
- Beautiful animated UI loads
- Quick questions are clickable
- Responses appear quickly (<1s)
- Responses are clean and formatted
- No error messages
- Smooth animations

❌ **Issues if you see:**
- White screen or errors
- Messy HTML/JSON in responses
- Slow responses (>2s)
- "Failed to fetch" errors
- Broken styling

## 🚀 Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables set
- [ ] Production build successful
- [ ] No console errors
- [ ] Mobile responsive works
- [ ] Performance acceptable
- [ ] Database populated
- [ ] README updated

## 📱 Browser Compatibility

✅ **Tested & Working:**
- Chrome 120+
- Safari 17+
- Firefox 120+
- Edge 120+
- Mobile Safari
- Mobile Chrome

## 🔗 Important URLs

- **Local Dev:** http://localhost:3000
- **API Endpoint:** http://localhost:3000/api/chat
- **AstraDB:** https://astra.datastax.com
- **F1 Source:** https://www.formula1.com
- **GitHub:** https://github.com/CHARMAQE/llm-app-Formula1

## 📚 Learning Resources

- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com
- **TypeScript:** https://www.typescriptlang.org
- **AstraDB Docs:** https://docs.datastax.com/en/astra-db-serverless

## 🎓 Key Concepts Used

1. **Server Components** - Next.js App Router
2. **API Routes** - Serverless functions
3. **React Hooks** - useState, useRef, useEffect
4. **Vector Embeddings** - Text → Numbers
5. **Semantic Search** - Meaning-based queries
6. **Tailwind CSS** - Utility-first styling
7. **TypeScript** - Type safety
8. **Puppeteer** - Automated browsing
9. **Web Scraping** - Content extraction
10. **Text Chunking** - Split for processing

## 💡 Pro Tips

1. **Always test locally before deploying**
2. **Use hard refresh to see CSS changes**
3. **Check console for errors**
4. **Run tests after major changes**
5. **Keep knowledge base updated**
6. **Monitor response times**
7. **Back up .env file securely**
8. **Document your changes**
9. **Use semantic git commits**
10. **Keep dependencies updated**

## 🎬 Quick Start (1 Minute)

```bash
git clone https://github.com/CHARMAQE/llm-app-Formula1.git
cd llm-app-Formula1
npm install
# Add .env with AstraDB credentials
npm run dev
# Open http://localhost:3000
```

## 📞 Getting Help

1. **Check documentation:** PROJECT_DOCUMENTATION.md
2. **Check architecture:** ARCHITECTURE.md
3. **Run tests:** node test-f1-chat.js
4. **Check console:** Browser DevTools
5. **Check terminal:** Server logs

---

**Last Updated:** November 13, 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready
