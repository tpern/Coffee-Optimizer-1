# Coffee Optimizer - Full Stack Application

A comprehensive coffee brewing optimization tool with a secure admin panel for managing user submissions and viewing analytics.

## 🚀 Features

### Public Site
- Coffee grinder reviews and information
- Brew recipe optimizer with SCA diagnosis
- Learning engine that adapts to your setup
- Multiple brew methods and grinder catalogs

### Admin Panel
- Secure JWT-based authentication
- Dashboard with analytics and charts
- Data management for all submissions
- Export functionality (CSV)
- Advanced filtering and search

### Data Collection
- Contact form submissions
- Grinder reviews and ratings
- SCA feedback
- Detailed brew review data (most important)

## 📋 Prerequisites

Before you begin, make sure you have:
- Node.js (v16 or higher) installed
- A MongoDB Atlas account (free tier works)
- A GitHub account (for deployment)
- A Vercel account (free tier works)

## 🛠️ Setup Instructions

### Step 1: Clone/Download the Project

If you're using this from GitHub, clone the repository:
```bash
git clone <your-repo-url>
cd coffee-optimizer
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- express (web server)
- mongoose (MongoDB)
- bcryptjs (password hashing)
- jsonwebtoken (authentication)
- And others...

### Step 3: Set Up MongoDB Atlas

1. **Create a MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose the FREE tier (M0)
   - Select a cloud provider and region (choose closest to you)
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access" in the left menu
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Enter a username and password (SAVE THESE!)
   - Set privileges to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Whitelist Your IP Address**
   - Go to "Network Access" in the left menu
   - Click "Add IP Address"
   - For development: Click "Add Current IP Address"
   - For production: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Your Connection String**
   - Go to "Database" in the left menu
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/...`)
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `coffee-optimizer` (or any name you prefer)

### Step 4: Configure Environment Variables

1. **Create a `.env` file** in the root directory:
```bash
cp .env.example .env
```

2. **Edit the `.env` file** with your values:

```env
# MongoDB Connection String (from Step 3)
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/coffee-optimizer?retryWrites=true&w=majority

# JWT Secret Key (generate a random string)
# You can use: https://randomkeygen.com/ (use CodeIgniter Encryption Keys)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# Admin Credentials (CHANGE THESE!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password-immediately

# Server Port (for local development)
PORT=3000

# Environment
NODE_ENV=development
```

**IMPORTANT SECURITY NOTES:**
- Never commit your `.env` file to GitHub
- Use a strong, random JWT_SECRET (at least 32 characters)
- Change the admin username and password immediately
- In production, use environment variables in Vercel dashboard

### Step 5: Create Your First Admin User

Run the setup script to create your admin user:

```bash
node scripts/setup-admin.js
```

This will prompt you for:
- Username
- Password (must be at least 8 characters)
- Password confirmation

**Note:** The script will create the admin user in your database. Make sure your MongoDB connection is working first!

### Step 6: Test Locally

1. **Start the server:**
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

2. **Open your browser:**
   - Main site: http://localhost:3000
   - Admin login: http://localhost:3000/admin/login

3. **Test the admin panel:**
   - Log in with the credentials you created
   - You should see the dashboard with statistics

4. **Test form submissions:**
   - Visit http://localhost:3000/forms/contact.html
   - Submit a test message
   - Check the admin panel to see it appear

## 📦 Deployment to Vercel

### Step 1: Push to GitHub

1. Initialize git (if not already):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a repository on GitHub and push:
```bash
git remote add origin https://github.com/yourusername/your-repo-name.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Sign up/login with your GitHub account

2. **Import Your Project:**
   - Click "Add New Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project:**
   - Framework Preset: "Other"
   - Root Directory: `./` (default)
   - Build Command: Leave empty (or `npm install`)
   - Output Directory: Leave empty
   - Install Command: `npm install`

4. **Set Environment Variables:**
   - Click "Environment Variables"
   - Add each variable from your `.env` file:
     - `MONGODB_URI` = (your MongoDB connection string)
     - `JWT_SECRET` = (your JWT secret)
     - `ADMIN_USERNAME` = (your admin username)
     - `ADMIN_PASSWORD` = (your admin password)
     - `NODE_ENV` = `production`

5. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete (usually 2-3 minutes)

6. **Update MongoDB IP Whitelist:**
   - Go back to MongoDB Atlas
   - Add Vercel's IP ranges or use "Allow Access from Anywhere" (0.0.0.0/0)
   - Your app should now work!

### Step 3: Access Your Deployed App

After deployment, Vercel will give you a URL like:
- `https://your-project-name.vercel.app`
- Main site: `https://your-project-name.vercel.app`
- Admin panel: `https://your-project-name.vercel.app/admin/login`

## 🔐 Security Best Practices

1. **Change Default Credentials:**
   - Never use the default admin username/password in production
   - Use the setup script to create a secure admin account

2. **Use Strong Secrets:**
   - JWT_SECRET should be at least 32 random characters
   - Generate using: https://randomkeygen.com/

3. **Protect Your .env File:**
   - Never commit `.env` to git (it's in `.gitignore`)
   - Use Vercel environment variables for production

4. **MongoDB Security:**
   - Use strong database passwords
   - Regularly rotate credentials
   - Monitor database access logs

## 📁 Project Structure

```
coffee-optimizer/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── adminController.js   # Admin API logic
│   └── publicController.js  # Public API logic
├── middleware/
│   ├── auth.js              # JWT authentication
│   └── validation.js        # Input validation
├── models/
│   ├── Admin.js             # Admin user model
│   ├── BrewReview.js        # Brew review model
│   ├── Contact.js           # Contact message model
│   ├── Review.js            # Review model
│   └── SCAFeedback.js       # SCA feedback model
├── public/                  # Frontend files
│   ├── admin/               # Admin panel
│   │   ├── login.html
│   │   └── dashboard.html
│   ├── forms/               # Public forms
│   │   ├── contact.html
│   │   ├── review.html
│   │   ├── sca-feedback.html
│   │   └── brew-review.html
│   ├── css/
│   │   ├── style.css        # Main site styles
│   │   └── admin.css        # Admin panel styles
│   ├── js/
│   │   ├── script.js        # Main site JavaScript
│   │   ├── admin.js         # Admin panel JavaScript
│   │   ├── admin-auth.js    # Admin authentication
│   │   └── forms.js         # Form submission handler
│   ├── index.html           # Main site
│   └── ...
├── routes/
│   ├── admin.js             # Admin API routes
│   └── public.js           # Public API routes
├── scripts/
│   └── setup-admin.js      # Admin user setup script
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies
├── server.js               # Main server file
├── vercel.json             # Vercel configuration
└── README.md              # This file
```

## 🧪 Testing Checklist

After setup, test the following:

### Public Site
- [ ] Main page loads correctly
- [ ] Coffee optimizer functionality works
- [ ] All forms are accessible

### Forms
- [ ] Contact form submits successfully
- [ ] Review form submits successfully
- [ ] SCA feedback form submits successfully
- [ ] Brew review form submits successfully

### Admin Panel
- [ ] Can log in with admin credentials
- [ ] Dashboard shows statistics
- [ ] Charts display correctly
- [ ] Can view contact messages
- [ ] Can view reviews
- [ ] Can view SCA feedback
- [ ] Can view brew reviews
- [ ] Can mark messages as read/unread
- [ ] Can approve/reject reviews
- [ ] Can delete entries
- [ ] Can export data to CSV
- [ ] Search and filter work
- [ ] Pagination works

### Security
- [ ] Cannot access admin routes without login
- [ ] JWT tokens expire after 24 hours
- [ ] Passwords are hashed in database
- [ ] Input validation works

## 🐛 Troubleshooting

### MongoDB Connection Issues
- **Error: "MongoServerError: bad auth"**
  - Check your username and password in the connection string
  - Make sure you replaced `<password>` with your actual password

- **Error: "MongoServerError: IP not whitelisted"**
  - Add your IP address in MongoDB Atlas Network Access
  - For Vercel, use "Allow Access from Anywhere" (0.0.0.0/0)

### Admin Login Issues
- **"Invalid credentials" error**
  - Make sure you created an admin user with the setup script
  - Check that username is lowercase (script converts it)
  - Verify password is correct

### Vercel Deployment Issues
- **Build fails**
  - Make sure all dependencies are in `package.json`
  - Check that `vercel.json` is correct
  - Review build logs in Vercel dashboard

- **Environment variables not working**
  - Make sure you added them in Vercel dashboard
  - Redeploy after adding environment variables
  - Check variable names match exactly (case-sensitive)

## 📝 API Documentation

### Public Endpoints

**POST /api/contact**
- Submit contact form
- Body: `{ name, email, message }`

**POST /api/reviews**
- Submit review
- Body: `{ grinderName, rating, reviewText, reviewerName? }`

**POST /api/sca-feedback**
- Submit SCA feedback
- Body: `{ feedbackText, rating, category? }`

**POST /api/brew-reviews**
- Submit brew review
- Body: `{ grinderUsed, brewMethod, ... }` (see model for all fields)

**GET /api/reviews**
- Get approved reviews (for public display)
- Query params: `grinderName?, limit?, page?`

### Admin Endpoints (Require JWT Token)

**POST /api/admin/login**
- Admin login
- Body: `{ username, password }`
- Returns: `{ token, admin }`

**GET /api/admin/stats**
- Get dashboard statistics
- Headers: `Authorization: Bearer <token>`

**GET /api/admin/contact-messages**
- Get all contact messages
- Query params: `page?, limit?, search?, read?`

**GET /api/admin/brew-reviews**
- Get all brew reviews
- Query params: `page?, limit?, search?, grinderUsed?, brewMethod?, dateFrom?, dateTo?`

**GET /api/admin/export/:type**
- Export data as CSV
- Types: `contacts`, `reviews`, `sca-feedback`, `brew-reviews`

See `controllers/adminController.js` for all available endpoints.

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the error logs in your terminal (local) or Vercel dashboard (production)
3. Verify all environment variables are set correctly
4. Make sure MongoDB connection is working

## 📄 License

This project is for your personal use.

## 🎉 You're All Set!

Your coffee optimizer is now a full-stack application with:
- ✅ Secure admin panel
- ✅ MongoDB database
- ✅ Public forms for data collection
- ✅ Analytics and data export
- ✅ Deployed on Vercel

Happy brewing! ☕
