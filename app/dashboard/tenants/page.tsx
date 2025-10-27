"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, User } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddTenant = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, "tenants"), {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "555-0100",
        organizationId: "org_1",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Failed to add tenant:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tenants</h1>
        <Button onClick={handleAddTenant} disabled={loading} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Tenant
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tenants.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No tenants yet</p>
              <Button onClick={handleAddTenant} disabled={loading}>
                Add Your First Tenant
              </Button>
            </CardContent>
          </Card>
        ) : (
          tenants.map((tenant) => (
            <Card key={tenant.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>
                    {tenant.firstName} {tenant.lastName}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{tenant.email}</p>
                <p className="text-sm mt-1">{tenant.phone}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

