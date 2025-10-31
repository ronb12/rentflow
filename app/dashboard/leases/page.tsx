"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddLeaseModal } from "@/components/modals/add-lease-modal";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

export default function LeasesPage() {
  const [leases, setLeases] = useState<any[]>([]);

  useEffect(() => {
    loadLeases();
  }, []);

  const loadLeases = async () => {
    try {
      const res = await fetch("/api/leases");
      if (!res.ok) {
        throw new Error(`Failed to load leases: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      setLeases(data);
    } catch (error) {
      console.error("Failed to load leases:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Leases</h1>
          <p className="text-muted-foreground mt-2">Manage active and expired leases</p>
        </div>
        <AddLeaseModal onLeaseAdded={loadLeases} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leases.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No leases yet</p>
              <AddLeaseModal onLeaseAdded={loadLeases} />
            </CardContent>
          </Card>
        ) : (
          leases.map((lease) => (
            <Card key={lease.id}>
              <CardHeader>
                <CardTitle>Lease #{lease.id.slice(-8)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Property: {lease.property_id}</p>
                <p className="text-sm text-muted-foreground">Tenant: {lease.tenant_id}</p>
                <p className="text-sm mt-2">Rent: ${lease.monthly_rent}/month</p>
                <p className="text-sm">Status: {lease.status}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

