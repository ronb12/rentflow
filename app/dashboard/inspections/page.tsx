"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Inspection } from "@/types";
import { getInspectionDrafts, updateInspectionStatus } from "@/lib/idb";
import { syncInspections as syncInspectionsToFirestore } from "@/lib/inspection-sync";

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    loadInspections();
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      attemptSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const loadInspections = async () => {
    const drafts = await getInspectionDrafts();
    setInspections(drafts);
  };

  const attemptSync = async () => {
    if (!navigator.onLine || syncing) return;

    setSyncing(true);
    try {
      const queuedInspections = inspections.filter((i) => i.status === "queued");
      if (queuedInspections.length === 0) {
        setSyncing(false);
        return;
      }

      await syncInspectionsToFirestore(queuedInspections);
      
      // Mark as synced
      for (const inspection of queuedInspections) {
        await updateInspectionStatus(inspection.id, "synced");
      }

      await loadInspections();
    } catch (error) {
      console.error("Failed to sync inspections:", error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inspections</h1>
          {!isOnline && (
            <p className="text-sm text-yellow-600 mt-2">Offline - Changes will sync when online</p>
          )}
        </div>
        <div className="flex gap-3">
          {syncing && (
            <Button disabled variant="outline">
              Syncing...
            </Button>
          )}
          <Link href="/dashboard/inspections/new">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              New Inspection
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {inspections.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No inspections yet</p>
              <Link href="/dashboard/inspections/new">
                <Button className="mt-4">Create Your First Inspection</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          inspections.map((inspection) => (
            <Card key={inspection.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {inspection.inspectionType.charAt(0).toUpperCase() +
                        inspection.inspectionType.slice(1)}{" "}
                      Inspection
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(inspection.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      inspection.status === "queued"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {inspection.status === "queued" ? "Queued" : "Synced"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Property: {inspection.propertyId}
                </p>
                {inspection.conditionNotes && (
                  <p className="text-sm line-clamp-2">{inspection.conditionNotes}</p>
                )}
                {inspection.status === "queued" && (
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" onClick={attemptSync} disabled={syncing}>
                      {syncing ? "Syncing..." : "Sync Now"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

