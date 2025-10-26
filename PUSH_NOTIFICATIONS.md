# Push Notifications Feature 📬

## Overview
The e-Nagarika portal now supports **real-time push notifications** to keep citizens updated about their applications, payments, and important announcements.

## Features

### ✨ Modern Web Push Notifications
- **Browser-based notifications** - Works on Chrome, Firefox, Edge, and Safari
- **Background notifications** - Receive updates even when the app is closed
- **Rich notifications** - Title, body, icon, and custom actions
- **Persistent** - Notifications stay until user interacts with them
- **Cross-platform** - Works on desktop and mobile browsers

### 🔔 Notification Types
Citizens will receive push notifications for:
- ✅ Application status updates (submitted, processing, approved, rejected)
- 📄 Document verification alerts
- 💰 Payment confirmations and reminders
- 📅 Appointment reminders
- 📢 Government announcements and service updates
- ⚠️ System maintenance notifications

### 🛠️ Technical Implementation

#### Architecture
```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   Frontend      │         │   Backend        │         │  Browser Push    │
│   (React)       │◄────────│   (Express.js)   │◄────────│  Service         │
│                 │         │                  │         │                  │
│  - Context API  │         │  - web-push lib  │         │  - Service       │
│  - Service      │         │  - VAPID keys    │         │    Worker        │
│    Worker       │         │  - Subscription  │         │  - Push Manager  │
│                 │         │    Management    │         │                  │
└─────────────────┘         └──────────────────┘         └──────────────────┘
```

#### Technology Stack
1. **Frontend**
   - `NotificationContext.tsx` - React context for notification state management
   - `sw.js` - Service worker for handling push events
   - `NotificationSettings.tsx` - UI component for managing preferences

2. **Backend**
   - `web-push` npm package - VAPID protocol implementation
   - Express.js routes - API endpoints for subscription management
   - In-memory store - Subscription storage (upgradeable to database)

3. **Security**
   - VAPID keys - Voluntary Application Server Identification
   - Public/Private key pair for authenticated push
   - Endpoint-based subscription management

## Setup Instructions

### 1. Backend Setup

#### Generated VAPID Keys
```env
VAPID_PUBLIC_KEY=BE29g2TR6nw581Rw6xrKyo-4Wrgd65q1cEbRhCzKo04k7KIQqW_ZnLoRLKFnB-QA4y09XvlaYQCdXg1-b-cFCWo
VAPID_PRIVATE_KEY=hvxSKoA7Xy4TkEPsd0gMjwvDPrhCRKLHKfICrF9K9ws
VAPID_SUBJECT=mailto:admin@enagarika.gov.in
```

These keys are already added to `backend/.env` file.

#### Install Dependencies
```bash
cd backend
npm install web-push
```

### 2. Frontend Setup

#### Service Worker Registration
The service worker (`public/sw.js`) is automatically registered in `src/main.tsx`:

```typescript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('Service Worker registered'))
    .catch(err => console.error('Service Worker registration failed'));
}
```

#### Provider Integration
The `NotificationProvider` is wrapped around the app in `src/App.tsx`:

```tsx
<NotificationProvider>
  {/* App content */}
</NotificationProvider>
```

### 3. Using Notifications in Components

```tsx
import { useNotifications } from '@/contexts/NotificationContext';

function MyComponent() {
  const { 
    permission, 
    isSubscribed, 
    requestPermission, 
    subscribe, 
    unsubscribe,
    sendNotification 
  } = useNotifications();

  const enableNotifications = async () => {
    await requestPermission();
    await subscribe();
  };

  return (
    <button onClick={enableNotifications}>
      Enable Notifications
    </button>
  );
}
```

## API Endpoints

### Push Notification Routes

#### 1. Get VAPID Public Key
```http
GET /api/notifications/push/vapid-public-key
```
**Response:**
```json
{
  "success": true,
  "publicKey": "BE29g2TR6nw581Rw6xrKyo-4Wrgd65q1cEbRhCzKo04k7KIQqW..."
}
```

#### 2. Subscribe to Notifications
```http
POST /api/notifications/push/subscribe
```
**Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```
**Response:**
```json
{
  "success": true,
  "message": "Push subscription added successfully",
  "subscribersCount": 5
}
```

#### 3. Unsubscribe from Notifications
```http
POST /api/notifications/push/unsubscribe
```
**Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

#### 4. Send Notification to All Subscribers
```http
POST /api/notifications/push/send
```
**Request Body:**
```json
{
  "title": "Application Approved ✅",
  "body": "Your driving license application has been approved!",
  "icon": "/logo.png",
  "badge": "/badge.png",
  "data": {
    "applicationId": "APP123",
    "url": "/applications/APP123"
  }
}
```
**Response:**
```json
{
  "success": true,
  "message": "Push notifications sent",
  "stats": {
    "total": 5,
    "successful": 4,
    "failed": 1,
    "remainingSubscribers": 4
  }
}
```

#### 5. Send Test Notification
```http
POST /api/notifications/push/test
```
**Response:**
```json
{
  "success": true,
  "message": "Test notifications sent to 4 subscriber(s)",
  "sent": 4,
  "total": 4
}
```

#### 6. Get Subscriber Count
```http
GET /api/notifications/push/subscribers/count
```
**Response:**
```json
{
  "success": true,
  "subscribersCount": 4,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Usage Guide

### For Citizens

#### Enabling Push Notifications
1. Visit the **Notifications page** (`/notifications`)
2. Click **"Enable"** button in the Push Notifications card
3. Allow notifications when browser prompts
4. You're subscribed! Test it with the **"Test"** button

#### Managing Notifications
- **Enable/Disable**: Toggle push notifications anytime
- **Test**: Send a test notification to verify setup
- **Browser Settings**: Manage notification permissions in browser settings

### For Administrators

#### Sending Push Notifications
1. Visit **Push Admin page** (`/push-admin`)
2. See active subscriber count
3. Compose notification:
   - Title (max 50 characters)
   - Body (max 200 characters)
4. Click **"Send to All Subscribers"** or use **Quick Actions** templates

#### Monitoring
- **Subscriber Count**: Real-time count updates every 5 seconds
- **Send Results**: See success/failure stats after sending
- **Failed Subscriptions**: Automatically cleaned up

## Browser Support

| Browser | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| Chrome  | ✅      | ✅     | Full support |
| Firefox | ✅      | ✅     | Full support |
| Edge    | ✅      | ✅     | Full support |
| Safari  | ✅      | ⚠️     | Limited on iOS |
| Opera   | ✅      | ✅     | Full support |

## Security & Privacy

### Security Features
- ✅ **VAPID Authentication** - Server identity verification
- ✅ **HTTPS Required** - Push only works on secure connections
- ✅ **User Permission** - Explicit user consent required
- ✅ **Endpoint Privacy** - Subscription endpoints are unique and private

### Privacy Considerations
- Users can revoke permission anytime
- No personal data stored in subscriptions
- Subscriptions expire automatically if browser/device removed
- Failed subscriptions are automatically cleaned up

## Testing

### Local Testing
1. Start backend: `cd backend && node server.js`
2. Start frontend: `npm run dev`
3. Open `http://localhost:8081/notifications`
4. Enable push notifications
5. Open `http://localhost:8081/push-admin` in another tab
6. Send a test notification

### Production Testing
- Ensure HTTPS is enabled (required for service workers)
- Verify VAPID keys are properly set in environment variables
- Test on multiple browsers and devices
- Monitor failed subscriptions and clean up

## Troubleshooting

### Common Issues

#### 1. Notifications Not Appearing
**Problem**: Enabled but no notifications show
**Solutions**:
- Check browser notification permissions (browser settings)
- Verify service worker is registered (DevTools > Application)
- Check browser console for errors
- Ensure HTTPS is enabled (required for production)

#### 2. "Notifications Not Supported"
**Problem**: Browser shows not supported message
**Solutions**:
- Use a modern browser (Chrome, Firefox, Edge)
- Enable HTTPS (service workers require secure context)
- Check if notifications are blocked system-wide

#### 3. Subscription Fails
**Problem**: Subscribe button doesn't work
**Solutions**:
- Check VAPID public key is loading correctly
- Verify backend is running and accessible
- Check network tab for failed API calls
- Ensure CORS is properly configured

#### 4. No Active Subscribers
**Problem**: Subscriber count shows 0
**Solutions**:
- Enable notifications on `/notifications` page first
- Check browser console for subscription errors
- Verify backend endpoint is receiving subscriptions
- Restart backend if subscriptions are in memory

## Future Enhancements

### Planned Features
- 📊 **Analytics Dashboard** - Track notification open rates
- 🗃️ **Database Storage** - Persist subscriptions across server restarts
- 👤 **User-specific Targeting** - Send to specific users/groups
- ⏰ **Scheduled Notifications** - Queue and schedule for later
- 🎯 **Smart Notifications** - AI-powered timing optimization
- 📱 **Mobile App Integration** - Native mobile push support
- 🌐 **Multi-language Support** - Notifications in user's preferred language
- 📈 **Delivery Reports** - Track delivery success/failure

### Database Schema (For Future Implementation)
```sql
CREATE TABLE push_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1
);

CREATE INDEX idx_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_endpoint ON push_subscriptions(endpoint);
```

## Resources

### Documentation
- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [web-push npm package](https://www.npmjs.com/package/web-push)

### Tools
- [VAPID Key Generator](https://web-push-codelab.glitch.me/)
- [Service Worker Test](https://serviceworke.rs/)
- [Push Notification Tester](https://tests.peter.sh/notification-generator/)

## Credits
Implemented as part of the e-Nagarika Karnataka Government Portal project to provide modern, real-time communication with citizens.

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Status**: ✅ Production Ready
