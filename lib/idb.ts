import { openDB, DBSchema, IDBPDatabase } from "idb";
import { Inspection } from "@/types";

interface RentFlowDB extends DBSchema {
  inspections: {
    key: string;
    value: Inspection;
    indexes: { propertyId: string; status: string };
  };
  photos: {
    key: string;
    value: { id: string; blob: Blob; inspectionId?: string };
  };
}

let dbInstance: IDBPDatabase<RentFlowDB> | null = null;

export async function getDB() {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<RentFlowDB>("rentflow", 1, {
    upgrade(db) {
      // Create inspections store
      const inspectionStore = db.createObjectStore("inspections", {
        keyPath: "id",
      });
      inspectionStore.createIndex("propertyId", "propertyId");
      inspectionStore.createIndex("status", "status");

      // Create photos store
      db.createObjectStore("photos", { keyPath: "id" });
    },
  });

  return dbInstance;
}

// Inspection helpers
export async function saveInspectionDraft(inspection: Inspection): Promise<void> {
  const db = await getDB();
  await db.put("inspections", inspection);
}

export async function getInspectionDrafts(): Promise<Inspection[]> {
  const db = await getDB();
  return db.getAll("inspections");
}

export async function getInspectionDraft(id: string): Promise<Inspection | undefined> {
  const db = await getDB();
  return db.get("inspections", id);
}

export async function deleteInspectionDraft(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("inspections", id);
}

export async function updateInspectionStatus(id: string, status: "queued" | "synced"): Promise<void> {
  const db = await getDB();
  const inspection = await db.get("inspections", id);
  if (inspection) {
    inspection.status = status;
    inspection.syncedAt = new Date();
    await db.put("inspections", inspection);
  }
}

// Photo helpers
export async function savePhoto(id: string, blob: Blob, inspectionId?: string): Promise<void> {
  const db = await getDB();
  await db.put("photos", { id, blob, inspectionId });
}

export async function getPhoto(id: string): Promise<Blob | undefined> {
  const db = await getDB();
  const photo = await db.get("photos", id);
  return photo?.blob;
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("photos", id);
}

export async function getPhotosByInspection(inspectionId: string): Promise<Blob[]> {
  const db = await getDB();
  const allPhotos = await db.getAll("photos");
  return allPhotos.filter((photo) => photo.inspectionId === inspectionId).map((photo) => photo.blob);
}

