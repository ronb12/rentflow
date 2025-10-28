#!/usr/bin/env node

// Load environment variables first
require('dotenv').config({ path: '.env.local' });

import { initSchema } from './lib/db';

async function initializeDatabase() {
  console.log('🔧 Initializing RentFlow database schema...');
  
  try {
    await initSchema();
    console.log('✅ Database schema initialized successfully!');
    
    // Test the connection
    const { query } = await import('./lib/db');
    const result = await query('SELECT name FROM sqlite_master WHERE type="table"');
    console.log('📊 Tables created:', result.map((row: any) => row.name));
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
