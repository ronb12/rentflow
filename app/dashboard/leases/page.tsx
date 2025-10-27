"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function LeasesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Leases</h1>
        <p className="text-muted-foreground mt-2">Manage active and expired leases</p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No leases yet</p>
        </CardContent>
      </Card>
    </div>
  );
}

