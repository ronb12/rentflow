import { collection, doc, addDoc } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Inspection } from "@/types";
import { getPhoto } from "./idb";

export async function syncInspections(inspections: Inspection[]): Promise<void> {
  for (const inspection of inspections) {
    // Upload photos to Storage
    const photoUrls: string[] = [];
    for (const photoId of inspection.photos) {
      const blob = await getPhoto(photoId);
      if (blob) {
        const storageRef = ref(storage, `inspections/${inspection.id}/${photoId}`);
        await uploadBytes(storageRef, blob);
        photoUrls.push(`inspections/${inspection.id}/${photoId}`);
      }
    }

    // Save to Firestore
    const inspectionData = {
      ...inspection,
      photos: photoUrls,
      syncedAt: new Date(),
    };

    await addDoc(collection(db, "inspections"), inspectionData);
  }
}

