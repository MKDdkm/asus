# Firebase Setup Guide

## How to Connect Firebase to Your Application

Your app now supports **BOTH JSON and Firebase** databases! By default, it uses JSON. Follow these steps to enable Firebase:

---

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or select existing project
3. Enter project name (e.g., "ai-sahayak" or "enagarika")
4. Follow the setup wizard

---

## Step 2: Enable Firestore Database

1. In Firebase Console, go to **Build > Firestore Database**
2. Click "Create Database"
3. Choose:
   - **Start in Test Mode** (for development)
   - **Location**: Choose closest to India (e.g., `asia-south1`)
4. Click "Enable"

---

## Step 3: Get Service Account Credentials

1. In Firebase Console, go to **Project Settings** (⚙️ icon)
2. Go to **Service Accounts** tab
3. Click **Generate New Private Key**
4. Download the JSON file (keep it secure!)

---

## Step 4: Configure Backend Environment Variables

Open `backend/.env` file and add your Firebase credentials:

```env
# Firebase Configuration
USE_FIREBASE=true
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
```

**Important**: 
- Copy values from the downloaded JSON file
- `FIREBASE_PRIVATE_KEY` must have `\n` for line breaks
- Keep the quotes around the private key

---

## Step 5: Configure Render Environment Variables

If deploying to Render:

1. Go to Render Dashboard > Your Service
2. Go to **Environment** tab
3. Add these variables:
   ```
   USE_FIREBASE = true
   FIREBASE_PROJECT_ID = your-project-id
   FIREBASE_CLIENT_EMAIL = your-client-email
   FIREBASE_PRIVATE_KEY = your-private-key-with-\n
   ```

---

## Step 6: Test the Connection

1. Restart your backend server:
   ```bash
   cd backend
   npm start
   ```

2. Look for this message:
   ```
   ✅ Firebase connected successfully
   📊 Database Mode: Firebase (Primary) + JSON (Backup)
   ```

3. Test API endpoints - they now use Firebase!

---

## How It Works

### Hybrid Database Mode

Your app uses a **smart hybrid system**:

1. **Firebase Disabled** (`USE_FIREBASE=false`):
   - Uses JSON files only
   - Fast, no external dependencies
   - Perfect for development

2. **Firebase Enabled** (`USE_FIREBASE=true`):
   - Firebase is primary database
   - JSON files serve as backup
   - Automatic fallback if Firebase fails
   - Real-time updates
   - Scalable for production

### Data Sync

When Firebase is enabled:
- All data is written to **Firebase first**
- Backup copy saved to **JSON files**
- If Firebase fails, app falls back to JSON
- Zero downtime!

---

## Firebase Security Rules

In Firebase Console > Firestore Database > Rules, use these rules:

### For Development (Testing):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### For Production (Secure):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated requests can read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Public read for certain collections
    match /citizens/{citizenId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Firestore Database Structure

Your collections will be:

```
firestore/
├── citizens/
│   ├── {citizenId}
│   │   ├── name
│   │   ├── email
│   │   ├── phone
│   │   ├── aadhaar
│   │   ├── createdAt
│   │   └── updatedAt
│
├── applications/
│   ├── {applicationId}
│   │   ├── citizenId
│   │   ├── type
│   │   ├── status
│   │   ├── createdAt
│   │   └── ...
│
├── payments/
│   ├── {paymentId}
│   │   ├── amount
│   │   ├── status
│   │   ├── method
│   │   └── ...
│
└── notifications/
    ├── {notificationId}
        ├── message
        ├── type
        ├── read
        └── ...
```

---

## Benefits of Firebase

✅ **Real-time Updates**: Data syncs instantly across all clients
✅ **Scalability**: Handles millions of users
✅ **Reliability**: 99.95% uptime SLA
✅ **Security**: Built-in authentication and rules
✅ **Free Tier**: 50K reads, 20K writes per day
✅ **Global CDN**: Fast access worldwide
✅ **Backup**: Your JSON files serve as local backup

---

## Switching Between Databases

**To use JSON only**:
```env
USE_FIREBASE=false
```

**To use Firebase + JSON backup**:
```env
USE_FIREBASE=true
```

No code changes needed! Just update the environment variable and restart.

---

## Troubleshooting

### Error: "Firebase not configured"
- Check if `FIREBASE_PROJECT_ID` is set in `.env`
- Verify credentials are correct

### Error: "Permission denied"
- Update Firestore security rules
- Make sure service account has proper permissions

### Error: "Network error"
- Check internet connection
- Verify Firebase project is active
- App will automatically fall back to JSON

---

## Cost Estimate (Firebase Free Tier)

| Resource | Free Tier | Your Usage | Status |
|----------|-----------|------------|--------|
| Stored Data | 1 GB | ~10 MB | ✅ Safe |
| Document Reads | 50K/day | ~1K/day | ✅ Safe |
| Document Writes | 20K/day | ~500/day | ✅ Safe |
| Network Egress | 10 GB/month | ~100 MB | ✅ Safe |

**You won't be charged unless you exceed these limits!**

---

## Next Steps

1. Create Firebase project
2. Enable Firestore
3. Download service account key
4. Update `.env` with credentials
5. Set `USE_FIREBASE=true`
6. Restart server
7. Test your app!

---

Need help? Check the error logs - the app will tell you exactly what's wrong!
