#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

import { RentFlowSeeder } from './seed-test-data';

async function main() {
  console.log('🌱 Seeding RentFlow database with test data...');
  
  const seeder = new RentFlowSeeder();
  await seeder.seedDatabase();
  
  console.log('✅ Test data seeding completed!');
  console.log('\n📊 Test Data Summary:');
  console.log('- 3 Test Users (owner, manager, test)');
  console.log('- 4 Properties (apartments, trailer park, houses)');
  console.log('- 5 Tenants with contact info');
  console.log('- 5 Active Leases');
  console.log('- 5 Invoices (pending, paid, overdue)');
  console.log('\n🧪 Ready for testing!');
}

main().catch(console.error);
