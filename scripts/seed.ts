import * as admin from "firebase-admin";
import { UserRole } from "../types";

// Initialize Firebase Admin (for seeding)
// This script should be run with service account credentials

async function seed() {
  console.log("Starting seed...");

  const db = admin.firestore();

  // Create organization
  const orgRef = await db.collection("organizations").add({
    name: "RentFlow Properties",
    address: "123 Main Street, City, ST 12345",
    phone: "555-0100",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const orgId = orgRef.id;
  console.log("Created organization:", orgId);

  // Create test users
  const users = [
    {
      email: "owner@example.com",
      password: "Owner!234",
      role: UserRole.OWNER,
    },
    {
      email: "manager@example.com",
      password: "Manager!234",
      role: UserRole.MANAGER,
    },
  ];

  for (const userData of users) {
    // Note: In production, create users via Firebase Auth Admin SDK
    await db.collection("users").add({
      email: userData.email,
      role: userData.role,
      organizationId: orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  console.log("Created users");

  // Create sample properties
  const properties = [
    {
      name: "Oak Apartments",
      address: "456 Oak Street",
      type: "apartment",
      organizationId: orgId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Riverside Mobile Home Park",
      address: "789 Riverside Drive",
      type: "trailer_park",
      organizationId: orgId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  for (const property of properties) {
    await db.collection("properties").add(property);
  }
  console.log("Created properties");

  // Create sample tenants
  const tenants = [
    {
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      phone: "555-1001",
      organizationId: orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      phone: "555-1002",
      organizationId: orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  for (const tenant of tenants) {
    await db.collection("tenants").add(tenant);
  }
  console.log("Created tenants");

  // Create offline inspection drafts (for IndexedDB)
  // Note: These would be created in the browser's IndexedDB
  console.log("Note: Offline inspections should be created via the app's UI");

  console.log("Seed complete!");
}

seed().catch(console.error);

