# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up MongoDB
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster (free M0 tier)
4. Create a database user (save username/password!)
5. Whitelist your IP (or use 0.0.0.0/0 for development)
6. Get connection string (click "Connect" → "Connect your application")

### 3. Create .env File
Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coffee-optimizer?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-key-at-least-32-characters-long
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
PORT=3000
NODE_ENV=development
```

**Generate JWT_SECRET:** https://randomkeygen.com/ (use CodeIgniter Encryption Keys)

### 4. Create Admin User
```bash
node scripts/setup-admin.js
```

Enter username and password when prompted.

### 5. Start Server
```bash
npm start
```

### 6. Access Your App
- **Main Site:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin/login

## 📝 Next Steps

1. Test form submissions at `/forms/contact.html`
2. Check admin panel to see submissions
3. Deploy to Vercel (see README.md for full instructions)

## ⚠️ Important Notes

- Never commit `.env` file to git
- Change default admin credentials before production
- Use strong passwords and JWT secrets
- Whitelist MongoDB IP addresses properly

## 🆘 Troubleshooting

**Can't connect to MongoDB?**
- Check connection string has correct password
- Verify IP is whitelisted in MongoDB Atlas
- Make sure cluster is running

**Admin login doesn't work?**
- Make sure you ran `node scripts/setup-admin.js`
- Check username is lowercase
- Verify password is correct

**Forms not submitting?**
- Check browser console for errors
- Verify server is running
- Check MongoDB connection

For detailed instructions, see README.md
