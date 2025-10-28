import { query } from './lib/db';

interface TestUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  organizationId: string;
}

interface TestProperty {
  id: string;
  name: string;
  address: string;
  type: string;
  organizationId: string;
  isActive: number;
}

interface TestTenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organizationId: string;
}

interface TestLease {
  id: string;
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  status: string;
}

interface TestInvoice {
  id: string;
  leaseId: string;
  amount: number;
  dueDate: string;
  status: string;
}

class RentFlowSeeder {
  async seedDatabase() {
    console.log('🌱 Seeding RentFlow database with test data...');
    
    try {
      // Seed users
      await this.seedUsers();
      
      // Seed properties
      await this.seedProperties();
      
      // Seed tenants
      await this.seedTenants();
      
      // Seed leases
      await this.seedLeases();
      
      // Seed invoices
      await this.seedInvoices();
      
      console.log('✅ Database seeding completed successfully!');
      
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  async seedUsers() {
    const users: TestUser[] = [
      {
        id: 'user_1',
        email: 'owner@rentflow.com',
        password: 'Owner123!',
        name: 'John Owner',
        role: 'owner',
        organizationId: 'org_1'
      },
      {
        id: 'user_2',
        email: 'manager@rentflow.com',
        password: 'Manager123!',
        name: 'Sarah Manager',
        role: 'manager',
        organizationId: 'org_1'
      },
      {
        id: 'user_3',
        email: 'test@example.com',
        password: 'testpassword123',
        name: 'Test User',
        role: 'manager',
        organizationId: 'org_1'
      }
    ];

    for (const user of users) {
      try {
        await query(
          `INSERT OR REPLACE INTO users (id, email, password, name, role, organization_id) VALUES (?, ?, ?, ?, ?, ?)`,
          [user.id, user.email, user.password, user.name, user.role, user.organizationId]
        );
        console.log(`✅ Created user: ${user.email}`);
      } catch (error) {
        console.log(`⚠️ User ${user.email} might already exist`);
      }
    }
  }

  async seedProperties() {
    const properties: TestProperty[] = [
      {
        id: 'prop_1',
        name: 'Sunset Apartments',
        address: '123 Sunset Blvd, Los Angeles, CA 90210',
        type: 'apartment',
        organizationId: 'org_1',
        isActive: 1
      },
      {
        id: 'prop_2',
        name: 'Riverside Trailer Park',
        address: '456 River Road, Riverside, CA 92501',
        type: 'trailer_park',
        organizationId: 'org_1',
        isActive: 1
      },
      {
        id: 'prop_3',
        name: 'Downtown Lofts',
        address: '789 Main Street, Downtown, CA 90211',
        type: 'apartment',
        organizationId: 'org_1',
        isActive: 1
      },
      {
        id: 'prop_4',
        name: 'Garden Villas',
        address: '321 Garden Way, Suburbia, CA 90212',
        type: 'house',
        organizationId: 'org_1',
        isActive: 1
      }
    ];

    for (const property of properties) {
      try {
        await query(
          `INSERT OR REPLACE INTO properties (id, name, address, type, organization_id, is_active) VALUES (?, ?, ?, ?, ?, ?)`,
          [property.id, property.name, property.address, property.type, property.organizationId, property.isActive]
        );
        console.log(`✅ Created property: ${property.name}`);
      } catch (error) {
        console.log(`⚠️ Property ${property.name} might already exist`);
      }
    }
  }

  async seedTenants() {
    const tenants: TestTenant[] = [
      {
        id: 'tenant_1',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@email.com',
        phone: '(555) 123-4567',
        organizationId: 'org_1'
      },
      {
        id: 'tenant_2',
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob.smith@email.com',
        phone: '(555) 234-5678',
        organizationId: 'org_1'
      },
      {
        id: 'tenant_3',
        firstName: 'Carol',
        lastName: 'Davis',
        email: 'carol.davis@email.com',
        phone: '(555) 345-6789',
        organizationId: 'org_1'
      },
      {
        id: 'tenant_4',
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@email.com',
        phone: '(555) 456-7890',
        organizationId: 'org_1'
      },
      {
        id: 'tenant_5',
        firstName: 'Emma',
        lastName: 'Brown',
        email: 'emma.brown@email.com',
        phone: '(555) 567-8901',
        organizationId: 'org_1'
      }
    ];

    for (const tenant of tenants) {
      try {
        await query(
          `INSERT OR REPLACE INTO tenants (id, first_name, last_name, email, phone, organization_id) VALUES (?, ?, ?, ?, ?, ?)`,
          [tenant.id, tenant.firstName, tenant.lastName, tenant.email, tenant.phone, tenant.organizationId]
        );
        console.log(`✅ Created tenant: ${tenant.firstName} ${tenant.lastName}`);
      } catch (error) {
        console.log(`⚠️ Tenant ${tenant.firstName} ${tenant.lastName} might already exist`);
      }
    }
  }

  async seedLeases() {
    const leases: TestLease[] = [
      {
        id: 'lease_1',
        propertyId: 'prop_1',
        tenantId: 'tenant_1',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        rentAmount: 1200.00,
        status: 'active'
      },
      {
        id: 'lease_2',
        propertyId: 'prop_1',
        tenantId: 'tenant_2',
        startDate: '2024-02-01',
        endDate: '2025-01-31',
        rentAmount: 1150.00,
        status: 'active'
      },
      {
        id: 'lease_3',
        propertyId: 'prop_2',
        tenantId: 'tenant_3',
        startDate: '2024-03-01',
        endDate: '2025-02-28',
        rentAmount: 800.00,
        status: 'active'
      },
      {
        id: 'lease_4',
        propertyId: 'prop_3',
        tenantId: 'tenant_4',
        startDate: '2024-01-15',
        endDate: '2024-12-15',
        rentAmount: 1500.00,
        status: 'active'
      },
      {
        id: 'lease_5',
        propertyId: 'prop_4',
        tenantId: 'tenant_5',
        startDate: '2024-04-01',
        endDate: '2025-03-31',
        rentAmount: 1800.00,
        status: 'active'
      }
    ];

    for (const lease of leases) {
      try {
        await query(
          `INSERT OR REPLACE INTO leases (id, property_id, tenant_id, start_date, end_date, rent_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [lease.id, lease.propertyId, lease.tenantId, lease.startDate, lease.endDate, lease.rentAmount, lease.status]
        );
        console.log(`✅ Created lease: ${lease.id}`);
      } catch (error) {
        console.log(`⚠️ Lease ${lease.id} might already exist`);
      }
    }
  }

  async seedInvoices() {
    const invoices: TestInvoice[] = [
      {
        id: 'inv_1',
        leaseId: 'lease_1',
        amount: 1200.00,
        dueDate: '2024-11-01',
        status: 'pending'
      },
      {
        id: 'inv_2',
        leaseId: 'lease_2',
        amount: 1150.00,
        dueDate: '2024-11-01',
        status: 'paid'
      },
      {
        id: 'inv_3',
        leaseId: 'lease_3',
        amount: 800.00,
        dueDate: '2024-11-01',
        status: 'overdue'
      },
      {
        id: 'inv_4',
        leaseId: 'lease_4',
        amount: 1500.00,
        dueDate: '2024-11-01',
        status: 'pending'
      },
      {
        id: 'inv_5',
        leaseId: 'lease_5',
        amount: 1800.00,
        dueDate: '2024-11-01',
        status: 'paid'
      }
    ];

    for (const invoice of invoices) {
      try {
        await query(
          `INSERT OR REPLACE INTO invoices (id, lease_id, amount, due_date, status) VALUES (?, ?, ?, ?, ?)`,
          [invoice.id, invoice.leaseId, invoice.amount, invoice.dueDate, invoice.status]
        );
        console.log(`✅ Created invoice: ${invoice.id}`);
      } catch (error) {
        console.log(`⚠️ Invoice ${invoice.id} might already exist`);
      }
    }
  }
}

// Run the seeder
const seeder = new RentFlowSeeder();
seeder.seedDatabase().catch(console.error);
