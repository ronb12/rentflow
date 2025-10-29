"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddPropertyModal } from "@/components/modals/add-property-modal";
import ProtectedPage from "@/components/ProtectedPage";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const res = await fetch("/api/properties");
      if (!res.ok) {
        throw new Error(`Failed to load properties: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      setProperties(data);
    } catch (error) {
      console.error("Failed to load properties:", error);
    }
  };

  return (
    <ProtectedPage allowedRoles={['manager']}>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Properties</h1>
          <AddPropertyModal onPropertyAdded={loadProperties} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No properties yet</p>
                <AddPropertyModal onPropertyAdded={loadProperties} />
              </CardContent>
            </Card>
          ) : (
            properties.map((property) => (
              <Card key={property.id}>
                <CardHeader>
                  <CardTitle>{property.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{property.address}</p>
                  <p className="text-sm mt-2">Type: {property.type}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}

