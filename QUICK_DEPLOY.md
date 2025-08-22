# 🚀 Quick Deployment Checklist

## Before You Start
- [ ] Push all code to GitHub main branch
- [ ] Create accounts on Vercel and Render
- [ ] Set up MongoDB Atlas database

## 1. Frontend (Vercel) ⚡
1. Go to [vercel.com](https://vercel.com)
2. Connect GitHub repo
3. Set environment variables:
   - `VITE_BACKEND_URL` = (your backend URL from step 2)
   - `VITE_AI_SERVICE_URL` = (your AI service URL from step 3)
4. Deploy!

## 2. Backend (Render) 🖥️
1. Go to [render.com](https://render.com)
2. New Web Service → Connect GitHub repo
3. Settings:
   - Build Command: `chmod +x build-backend.sh && ./build-backend.sh`
   - Start Command: `cd src/backend && npm start`
4. Environment Variables:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = (your MongoDB connection string)
   - `JWT_SECRET` = (random secure string)
   - `CORS_ORIGIN` = (your Vercel frontend URL)
5. Deploy!

## 3. AI Service (Render) 🤖
1. Go to [render.com](https://render.com)
2. New Web Service → Connect GitHub repo
3. Settings:
   - Runtime: Python
   - Build Command: `chmod +x build-ai.sh && ./build-ai.sh`
   - Start Command: `cd ai_service && uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables:
   - `PYTHON_VERSION` = `3.11.4`
   - `GEMINI_API_KEY` = (optional, for AI features)
5. Deploy!

## 4. Update Frontend URLs 🔄
1. Copy backend and AI service URLs from Render
2. Update Vercel environment variables
3. Redeploy frontend

## 5. Test Everything ✅
- [ ] Frontend loads
- [ ] Can create account/login
- [ ] Games work
- [ ] Leaderboards work
- [ ] Real-time features work

## 🎉 You're Live!

Your app will be available at:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`
- AI Service: `https://your-ai.onrender.com`

## 💰 Expected Costs
- Vercel: Free
- Render: $7/month per service ($14 total)
- MongoDB: Free tier
- **Total: ~$14/month**
