"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const res = await fetch("/api/properties");
      const data = await res.json();
      setProperties(data);
    } catch (error) {
      console.error("Failed to load properties:", error);
    }
  };

  const handleAddProperty = async () => {
    setLoading(true);
    try {
      await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Sample Property",
          address: "123 Main St",
          type: "apartment",
          organizationId: "org_1",
          isActive: true,
        }),
      });
      await loadProperties();
    } catch (error) {
      console.error("Failed to add property:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Properties</h1>
        <Button onClick={handleAddProperty} disabled={loading} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No properties yet</p>
              <Button onClick={handleAddProperty} disabled={loading}>
                Add Your First Property
              </Button>
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
  );
}

