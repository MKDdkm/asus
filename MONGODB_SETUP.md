# MongoDB Setup Guide for e-Nagarika

## 🗄️ MongoDB Integration

Your e-Nagarika project now supports **MongoDB** as the database! You can choose between:
- **JSON Database** (default, file-based)
- **MongoDB** (scalable, production-ready)

---

## 📋 **Option 1: Local MongoDB (For Development)**

### **Step 1: Install MongoDB**

#### **Windows:**
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Run the installer (choose "Complete" installation)
3. Install as a Windows Service (check the box during installation)
4. MongoDB will start automatically

#### **Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### **Linux (Ubuntu/Debian):**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### **Step 2: Verify MongoDB is Running**
```bash
# Check if MongoDB is running
mongosh

# You should see:
# Current Mongosh Log ID: ...
# Connecting to: mongodb://127.0.0.1:27017/
```

### **Step 3: Enable MongoDB in Your Project**
In `backend/.env`, set:
```env
USE_MONGODB=true
MONGODB_URI=mongodb://localhost:27017/enagarika
```

---

## 📋 **Option 2: MongoDB Atlas (Cloud - Recommended for Production)**

### **Step 1: Create Free MongoDB Atlas Account**
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for a **FREE M0 cluster** (512MB storage)
3. Choose a cloud provider (AWS/Azure/Google Cloud)
4. Select a region (closest to you for better performance)

### **Step 2: Create Database User**
1. In Atlas Dashboard → **Database Access**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `enagarika_admin`
5. Password: (generate strong password)
6. User Privileges: **"Atlas Admin"** or **"Read and Write to any database"**
7. Click **"Add User"**

### **Step 3: Whitelist Your IP**
1. In Atlas Dashboard → **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   - Or enter your specific IP address for security
4. Click **"Confirm"**

### **Step 4: Get Connection String**
1. In Atlas Dashboard → **Database** → **Connect**
2. Choose **"Connect your application"**
3. Select **"Node.js"** driver
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/enagarika?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your credentials

### **Step 5: Update `.env` File**
In `backend/.env`:
```env
USE_MONGODB=true
MONGODB_URI=mongodb+srv://enagarika_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/enagarika?retryWrites=true&w=majority
```

---

## 🚀 **Starting the Server with MongoDB**

### **Development:**
```bash
cd backend
npm run dev
```

### **Production:**
```bash
cd backend
npm start
```

### **Expected Console Output:**
```
🔄 Connecting to MongoDB...
✅ Connected to MongoDB successfully
🚀 ============================================
🏛️  e-Nagarika Backend Server Started
🚀 ============================================
📍 Server running on: http://localhost:3001
🌐 API Base URL: http://localhost:3001/api
⚡ Environment: development
📊 Database: MongoDB
🚀 ============================================
```

---

## 📊 **MongoDB Models Created**

### **1. Citizen Model** (`backend/models/Citizen.js`)
```javascript
{
  citizen_id: String (unique),
  name: String,
  name_kannada: String,
  aadhaar_number: String (unique),
  phone_number: String,
  email: String,
  date_of_birth: Date,
  gender: String,
  address: String,
  pincode: String,
  district: String,
  created_at: Date,
  updated_at: Date
}
```

### **2. Application Model** (`backend/models/Application.js`)
```javascript
{
  application_id: String (unique),
  service_type: String,
  applicant_name: String,
  aadhaar_number: String,
  status: String (pending/under_review/approved/rejected),
  submitted_date: Date,
  documents: Array,
  service_data: Object (flexible),
  created_at: Date,
  updated_at: Date
}
```

### **3. Payment Model** (`backend/models/Payment.js`)
```javascript
{
  payment_id: String (unique),
  application_id: String,
  amount: Number,
  payment_method: String,
  transaction_id: String,
  status: String (pending/processing/completed/failed),
  payment_date: Date,
  service_type: String,
  created_at: Date,
  updated_at: Date
}
```

---

## 🔧 **Switching Between Databases**

### **Use JSON Database (File-based):**
```env
USE_MONGODB=false
```

### **Use MongoDB:**
```env
USE_MONGODB=true
MONGODB_URI=your_mongodb_connection_string
```

---

## 📦 **MongoDB GUI Tools (Optional)**

### **MongoDB Compass (Official GUI)**
- Download: https://www.mongodb.com/products/compass
- Connect using your connection string
- Visual interface to browse data

### **Studio 3T (Advanced)**
- Download: https://studio3t.com/download/
- Free for non-commercial use
- SQL queries, data import/export

---

## 🛠️ **Useful MongoDB Commands**

### **Connect to MongoDB:**
```bash
mongosh
```

### **Show Databases:**
```javascript
show dbs
```

### **Use e-Nagarika Database:**
```javascript
use enagarika
```

### **Show Collections:**
```javascript
show collections
```

### **View All Citizens:**
```javascript
db.citizens.find().pretty()
```

### **Count Applications:**
```javascript
db.applications.countDocuments()
```

### **Find Pending Applications:**
```javascript
db.applications.find({ status: "pending" })
```

---

## 🔐 **Security Best Practices**

1. **Never commit `.env` file** to Git
2. Use **strong passwords** for MongoDB users
3. **Whitelist specific IPs** instead of "Allow from Anywhere"
4. Enable **MongoDB authentication** in production
5. Use **environment variables** for connection strings
6. Regularly **backup your database**

---

## 📈 **Performance Tips**

1. **Indexes are already created** on:
   - `citizen_id`, `aadhaar_number` (Citizens)
   - `application_id`, `service_type`, `status` (Applications)
   - `payment_id`, `status` (Payments)

2. **Monitor your queries** in MongoDB Atlas
3. Use **connection pooling** (already configured in Mongoose)
4. **Limit query results** for large datasets

---

## 🆘 **Troubleshooting**

### **Error: "MongoNetworkError: failed to connect"**
- **Solution:** Check if MongoDB is running (`mongosh`)
- Verify connection string in `.env`
- Check firewall/network access

### **Error: "Authentication failed"**
- **Solution:** Verify username/password in connection string
- Check database user permissions in Atlas

### **Error: "IP not whitelisted"**
- **Solution:** Add your IP in MongoDB Atlas Network Access

### **Error: "Cannot find module 'mongoose'"**
- **Solution:** Run `npm install mongoose` in backend folder

---

## 📞 **Support**

- MongoDB Documentation: https://docs.mongodb.com/
- MongoDB University (Free Courses): https://university.mongodb.com/
- Community Forums: https://www.mongodb.com/community/forums/

---

## ✅ **Next Steps**

1. ✅ MongoDB installed & configured
2. ✅ Models created (Citizen, Application, Payment)
3. ✅ Server updated to support MongoDB
4. 🔄 **Test your setup:**
   ```bash
   cd backend
   npm run dev
   ```
5. 🔄 **Migrate existing data** (if needed)
6. 🔄 **Deploy to production** with MongoDB Atlas

---

**Your e-Nagarika project is now MongoDB-ready!** 🎉
