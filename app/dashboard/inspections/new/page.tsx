"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { saveInspectionDraft, savePhoto, updateInspectionStatus } from "@/lib/idb";
import { Camera } from "lucide-react";
import { Inspection } from "@/types";
import { compressImage } from "@/lib/image-compression";

export default function NewInspectionPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    inspectionType: "regular",
    propertyId: "",
    conditionNotes: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      try {
        // Compress image to save Storage quota
        const compressedBlob = await compressImage(file);
        const id = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await savePhoto(id, compressedBlob);
        setPhotos((prev) => [...prev, id]);
      } catch (error) {
        console.error("Failed to process image:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const inspection: Inspection = {
        id: `inspection_${Date.now()}`,
        organizationId: "org_1", // Will be set from auth
        propertyId: formData.propertyId,
        inspectionType: formData.inspectionType as any,
        status: "queued",
        date: new Date(formData.date),
        conditionNotes: formData.conditionNotes,
        photos,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to IndexedDB first (offline)
      await saveInspectionDraft(inspection);

      // Try to sync if online
      if (navigator.onLine) {
        try {
          await fetch("/api/inspections", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(inspection),
          });
          await updateInspectionStatus(inspection.id, "synced");
        } catch (error) {
          console.log("Will sync when online:", error);
        }
      }

      // Register background sync
      if ("serviceWorker" in navigator && "sync" in (self as any).registration) {
        try {
          const registration = await (navigator.serviceWorker as any).ready;
          await registration.sync.register("sync-inspections");
        } catch (err) {
          console.log("Background sync not available:", err);
        }
      }

      router.push("/dashboard/inspections");
    } catch (error) {
      console.error("Failed to save inspection:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">New Inspection</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Inspection Type</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={formData.inspectionType}
                  onChange={(e) => setFormData({ ...formData, inspectionType: e.target.value })}
                  required
                >
                  <option value="move_in">Move-In</option>
                  <option value="move_out">Move-Out</option>
                  <option value="regular">Regular</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Property ID</label>
                <Input
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                  placeholder="Enter property ID"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Condition Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                value={formData.conditionNotes}
                onChange={(e) => setFormData({ ...formData, conditionNotes: e.target.value })}
                placeholder="Enter condition notes..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="mr-2 h-4 w-4" />
                Add Photos
              </Button>
              {photos.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {photos.length} photo(s) added
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Inspection"}
          </Button>
        </div>
      </form>
    </div>
  );
}

