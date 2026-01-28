/**
 * =====================================================
 * ADMIN USER SETUP SCRIPT
 * =====================================================
 * Run this script to create your first admin user
 * 
 * Usage: node scripts/setup-admin.js
 * 
 * This will prompt you for username and password
 * and create an admin user in the database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupAdmin() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined in .env file');
      console.error('Please create a .env file with your MongoDB connection string');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      console.log('⚠️  An admin user already exists in the database.');
      const overwrite = await question('Do you want to create another admin? (yes/no): ');
      if (overwrite.toLowerCase() !== 'yes') {
        console.log('Setup cancelled.');
        process.exit(0);
      }
    }

    // Get username
    const username = await question('Enter admin username: ');
    if (!username || username.length < 3) {
      console.error('❌ Username must be at least 3 characters');
      process.exit(1);
    }

    // Check if username already exists
    const existing = await Admin.findOne({ username: username.toLowerCase() });
    if (existing) {
      console.error('❌ Username already exists');
      process.exit(1);
    }

    // Get password
    const password = await question('Enter admin password (min 8 characters): ');
    if (!password || password.length < 8) {
      console.error('❌ Password must be at least 8 characters');
      process.exit(1);
    }

    // Confirm password
    const confirmPassword = await question('Confirm password: ');
    if (password !== confirmPassword) {
      console.error('❌ Passwords do not match');
      process.exit(1);
    }

    // Create admin user
    console.log('📝 Creating admin user...');
    const admin = new Admin({
      username: username.toLowerCase(),
      password: password
    });

    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log(`   Username: ${admin.username}`);
    console.log('   You can now log in at /admin/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.connection.close();
  }
}

// Run setup
setupAdmin();
