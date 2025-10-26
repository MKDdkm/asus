# 🚀 Deployment Guide - e-Nagarika

## ✅ Deployment Configuration Status

### Frontend (Vercel) - ✅ READY
- **Platform**: Vercel
- **Config File**: `vercel.json` ✅
- **Framework**: Vite + React
- **Build Command**: `npm install && npm run build`
- **Output Directory**: `dist`
- **Environment Variable**: 
  - `VITE_API_URL=https://asus-2.onrender.com/api` (set in `.env.production`)

### Backend (Render) - ✅ READY
- **Platform**: Render
- **Config File**: `render.yaml` ✅
- **Service Name**: `asus-backend`
- **Runtime**: Node.js
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Port**: 10000
- **Region**: Oregon (Free tier)

---

## 🔧 Fixed Issues

### 1. ✅ API URL Configuration
**Problem**: Hardcoded `localhost:3001` in `PushNotificationAdmin.tsx`
**Fixed**: Now uses `import.meta.env.VITE_API_URL || 'https://asus-2.onrender.com/api'`

### 2. ✅ Push Notification Routes
**Problem**: Missing `/push/` prefix in NotificationContext routes
**Fixed**: 
- `/notifications/vapid-public-key` → `/notifications/push/vapid-public-key`
- `/notifications/subscribe` → `/notifications/push/subscribe`
- `/notifications/unsubscribe` → `/notifications/push/unsubscribe`

### 3. ✅ VAPID Keys in Render
**Problem**: Missing VAPID environment variables in `render.yaml`
**Fixed**: Added to `render.yaml`:
- `VAPID_PUBLIC_KEY` (set manually in Render dashboard)
- `VAPID_PRIVATE_KEY` (set manually in Render dashboard)
- `VAPID_SUBJECT=mailto:admin@enagarika.gov.in`

---

## 📋 Deployment Steps

### Step 1: Deploy Backend to Render

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Fixed deployment configuration"
   git push origin main
   ```

2. **Go to Render Dashboard**: https://dashboard.render.com/

3. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `MKDdkm/asus`
   - Select branch: `main`

4. **Configure Service**:
   - **Name**: `asus-backend` (or your preferred name)
   - **Region**: Oregon (Free)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

5. **Set Environment Variables** in Render Dashboard:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `VAPID_PUBLIC_KEY=<your-vapid-public-key>`
   - `VAPID_PRIVATE_KEY=<your-vapid-private-key>`
   - `VAPID_SUBJECT=mailto:admin@enagarika.gov.in`
   - `JWT_SECRET=<your-jwt-secret>`
   - `FRONTEND_URL=<your-vercel-url>`

   **Note**: Copy VAPID keys from your local `backend/.env` file

6. **Deploy**: Click "Create Web Service"

7. **Note Your Backend URL**: Will be something like:
   - `https://asus-2.onrender.com` ✅ (you already have this)

---

### Step 2: Deploy Frontend to Vercel

1. **Update `.env.production`** (already done ✅):
   ```bash
   VITE_API_URL=https://asus-2.onrender.com/api
   ```

2. **Go to Vercel Dashboard**: https://vercel.com/dashboard

3. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository: `MKDdkm/asus`

4. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

5. **Environment Variables**:
   - Add: `VITE_API_URL` = `https://asus-2.onrender.com/api`

6. **Deploy**: Click "Deploy"

7. **Note Your Frontend URL**: Will be something like:
   - `https://your-project.vercel.app`

---

## 🔐 Environment Variables Reference

### Backend (Render Dashboard)
```bash
NODE_ENV=production
PORT=10000
VAPID_PUBLIC_KEY=<copy from backend/.env>
VAPID_PRIVATE_KEY=<copy from backend/.env>
VAPID_SUBJECT=mailto:admin@enagarika.gov.in
JWT_SECRET=enagarika_admin_secret_key_2024_super_secure
FRONTEND_URL=<your-vercel-url>
```

### Frontend (Vercel Dashboard)
```bash
VITE_API_URL=https://asus-2.onrender.com/api
```

---

## ✅ Post-Deployment Checklist

### Backend Health Check
- [ ] Visit: `https://asus-2.onrender.com/api/citizens`
- [ ] Should return citizens data or empty array
- [ ] Check logs in Render dashboard for errors

### Frontend Check
- [ ] Visit your Vercel URL
- [ ] Test citizen management (add/edit/delete)
- [ ] Test push notifications:
  - Go to `/notifications` page
  - Enable push notifications
  - Check browser permission prompt
  - Test sending notification from `/push-admin`

### Push Notifications Check
- [ ] Push subscription working
- [ ] VAPID keys loaded correctly
- [ ] Service worker registered
- [ ] Admin can send notifications

---

## 🐛 Troubleshooting

### Issue: Push notifications not working
**Solution**: 
1. Check VAPID keys are set correctly in Render
2. Verify service worker is registered (check browser console)
3. Check backend logs for web-push errors

### Issue: CORS errors
**Solution**: 
1. Add your Vercel URL to `FRONTEND_URL` in Render env vars
2. Restart backend service

### Issue: 404 on API calls
**Solution**: 
1. Verify `VITE_API_URL` in Vercel dashboard
2. Check backend is deployed and running
3. Verify API routes in backend/server.js

### Issue: Render service sleeping (Free tier)
**Note**: Free tier sleeps after 15 minutes of inactivity
- First request after sleep may take 30-60 seconds
- Consider upgrading to paid tier for production

---

## 📱 Testing Mobile Access

After deployment, test from mobile:
1. Open your Vercel URL on mobile browser
2. Test citizen management
3. Test push notifications (may require HTTPS)
4. Verify all features work

---

## 🎉 All Set!

Your deployment configuration is now **production-ready**! ✅

**What was fixed:**
- ✅ API URLs now use environment variables
- ✅ Push notification routes corrected
- ✅ VAPID keys added to Render config
- ✅ All hardcoded URLs removed
- ✅ Build tested and successful

**Next Steps:**
1. Push code to GitHub
2. Deploy backend to Render
3. Deploy frontend to Vercel
4. Test all features
5. Share your live URL! 🚀

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check Render logs for backend errors
3. Verify all environment variables are set
4. Ensure VAPID keys match between local and production
