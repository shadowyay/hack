# 🚀 Deployment Guide

This monorepo contains three services that need to be deployed separately:
- **Frontend** (React + Vite) → Vercel
- **Backend** (Node.js + Express) → Render
- **AI Service** (Python + FastAPI) → Render

## 📋 Prerequisites

1. GitHub account with your repository
2. Vercel account
3. Render account
4. MongoDB Atlas account (for database)

## 🎯 Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select the root directory (not a subdirectory)

2. **Configure Build Settings**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**
   Go to Project Settings → Environment Variables and add:
   ```
   VITE_BACKEND_URL=https://your-backend-app.onrender.com
   VITE_AI_SERVICE_URL=https://your-ai-service.onrender.com
   VITE_APP_ENV=production
   ```

4. **Deploy**
   - Click "Deploy"
   - Your frontend will be available at `https://your-app-name.vercel.app`

### Step 2: Custom Domain (Optional)
- Go to Project Settings → Domains
- Add your custom domain
- Configure DNS settings as instructed

## 🖥️ Backend Deployment (Render)

### Step 1: Create Web Service

1. **Create New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: `your-app-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty (we'll use build script)
   - **Runtime**: `Node`
   - **Build Command**: `chmod +x build-backend.sh && ./build-backend.sh`
   - **Start Command**: `cd src/backend && npm start`

3. **Set Environment Variables**
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bounty_hunters_db
   JWT_SECRET=your-jwt-secret-key
   PORT=10000
   CORS_ORIGIN=https://your-app-name.vercel.app
   ```

4. **Advanced Settings**
   - **Auto-Deploy**: Yes
   - **Health Check Path**: `/` (optional)

### Step 2: MongoDB Setup

1. **Create MongoDB Atlas Cluster**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Create a new cluster (free tier available)
   - Create a database user
   - Whitelist your IP (or use 0.0.0.0/0 for Render)

2. **Get Connection String**
   - Go to Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Use this as your `MONGO_URI` environment variable

## 🤖 AI Service Deployment (Render)

### Step 1: Create Web Service

1. **Create New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: `your-app-ai-service`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: `Python 3`
   - **Build Command**: `chmod +x build-ai.sh && ./build-ai.sh`
   - **Start Command**: `cd ai_service && uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables**
   ```
   PYTHON_VERSION=3.11.4
   GEMINI_API_KEY=your-gemini-api-key-here
   ENVIRONMENT=production
   ```

4. **Advanced Settings**
   - **Auto-Deploy**: Yes
   - **Health Check Path**: `/docs` (FastAPI auto-docs)

## 🔄 Update Frontend with Backend URLs

After both backend services are deployed:

1. **Get Service URLs**
   - Backend: `https://your-app-backend.onrender.com`
   - AI Service: `https://your-app-ai-service.onrender.com`

2. **Update Vercel Environment Variables**
   - Go to Vercel Project Settings → Environment Variables
   - Update `VITE_BACKEND_URL` and `VITE_AI_SERVICE_URL`
   - Redeploy your frontend

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in package.json/requirements.txt
   - Verify file paths are correct

2. **CORS Errors**
   - Make sure backend CORS is configured for your frontend domain
   - Update CORS_ORIGIN environment variable

3. **Database Connection**
   - Verify MongoDB connection string
   - Check if IP is whitelisted
   - Ensure database user has correct permissions

4. **Environment Variables**
   - Double-check all required env vars are set
   - Restart services after changing environment variables

### Monitoring

1. **Render Logs**
   - Go to your service dashboard
   - Click "Logs" tab to see real-time logs

2. **Vercel Analytics**
   - Check function logs in Vercel dashboard
   - Monitor performance and errors

## 🔐 Security Checklist

- [ ] JWT secret is secure and unique
- [ ] Database credentials are secure
- [ ] API keys are set as environment variables
- [ ] CORS is properly configured
- [ ] MongoDB IP whitelist is configured
- [ ] All secrets are in environment variables (not code)

## 🚀 Going Live

1. **Test Everything**
   - Frontend loads correctly
   - Backend API responses work
   - AI service responses work
   - Database operations work
   - Real-time features work (WebSocket)

2. **Performance Optimization**
   - Enable compression in backend
   - Optimize database queries
   - Configure caching if needed
   - Monitor response times

3. **Custom Domains** (Optional)
   - Configure custom domain for frontend
   - Set up SSL certificates
   - Update CORS settings for new domain

## 📊 Estimated Costs

- **Vercel**: Free tier (hobby projects)
- **Render**: 
  - Web Service: $7/month per service (2 services = $14/month)
  - Free tier available with limitations
- **MongoDB Atlas**: Free tier (512MB storage)
- **Total**: $0-14/month depending on usage

## 🔄 Continuous Deployment

Your apps will auto-deploy when you push to the main branch:
- Vercel: Automatically deploys on git push
- Render: Automatically deploys on git push (if auto-deploy enabled)

## 📱 Mobile Considerations

Your React app is responsive and will work on mobile devices. Consider:
- Testing on various screen sizes
- Optimizing touch interactions for games
- Performance on mobile networks

---

**Need Help?** Check the logs in each platform's dashboard for detailed error information.
