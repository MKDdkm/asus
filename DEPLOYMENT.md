# Vercel Environment Variables Setup

After deploying your backend to Render/Railway:

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add this variable:

   Name: VITE_API_URL
   Value: https://your-backend-url.onrender.com/api
   
4. Redeploy your frontend

## Quick Backend Deployment Steps:

### Using Render (FREE):
1. Go to render.com
2. New → Web Service
3. Connect GitHub repo: MKDdkm/asus
4. Root Directory: backend
5. Build: npm install
6. Start: node server.js
7. Copy the URL and add to Vercel env vars

### Using Railway (FREE):
1. Go to railway.app
2. New Project → From GitHub
3. Select: MKDdkm/asus
4. Set root: /backend
5. Deploy and copy URL
