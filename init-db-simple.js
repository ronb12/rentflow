#!/usr/bin/env node

// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const { initSchema, query } = require('./lib/db');

async function initializeDatabase() {
  console.log('🔧 Initializing RentFlow database schema...');
  
  try {
    await initSchema();
    console.log('✅ Database schema initialized successfully!');
    
    // Test the connection
    const result = await query('SELECT name FROM sqlite_master WHERE type="table"');
    console.log('📊 Tables created:', result.map(row => row.name));
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
