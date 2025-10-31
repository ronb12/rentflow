"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddPropertyModal } from "@/components/modals/add-property-modal";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import ProtectedPage from "@/components/ProtectedPage";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ id: "", name: "", address: "", type: "apartment" });

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

  useEffect(() => {
    loadProperties();
  }, []);

  return (
    <ProtectedPage allowedRoles={['manager']}>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Properties</h1>
          <AddPropertyModal onPropertyAdded={loadProperties} />
        </div>

        {properties.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No properties yet</p>
              <AddPropertyModal onPropertyAdded={loadProperties} />
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Name</th>
                  <th className="text-left px-3 py-2 font-medium">Address</th>
                  <th className="text-left px-3 py-2 font-medium">Type</th>
                  <th className="text-left px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id} className="border-t">
                    <td className="px-3 py-2 font-medium">{property.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{property.address}</td>
                    <td className="px-3 py-2">{property.type}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditForm({ id: property.id, name: property.name || "", address: property.address || "", type: property.type || "apartment" });
                            setEditOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(property.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Modal */}
        {editOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-md shadow-lg w-full max-w-md p-4">
              <div className="text-lg font-semibold mb-3">Edit Property</div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <input className="w-full border rounded px-2 py-2" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Address</label>
                  <input className="w-full border rounded px-2 py-2" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select className="w-full border rounded px-2 py-2" value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="trailer">Trailer</option>
                    <option value="duplex">Duplex</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button onClick={async () => {
                  try {
                    const res = await fetch(`/api/properties/${editForm.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editForm.name, address: editForm.address, type: editForm.type }) });
                    if (!res.ok) throw new Error('Failed to update');
                    setEditOpen(false);
                    loadProperties();
                  } catch {
                    alert('Failed to update property');
                  }
                }}>Save</Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-md shadow-lg w-full max-w-sm p-4">
              <div className="text-lg font-semibold mb-2">Delete Property</div>
              <p className="text-sm text-muted-foreground">Are you sure you want to delete this property? This will archive it and hide from lists.</p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                <Button variant="destructive" onClick={async () => {
                  try {
                    const res = await fetch(`/api/properties/${deleteId}`, { method: 'DELETE' });
                    if (!res.ok) throw new Error('Failed to delete');
                    setDeleteId(null);
                    loadProperties();
                  } catch {
                    alert('Failed to delete property');
                  }
                }}>Delete</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}

