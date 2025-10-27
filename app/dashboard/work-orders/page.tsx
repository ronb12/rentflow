"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

export default function WorkOrdersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Work Orders</h1>
        <p className="text-muted-foreground mt-2">Manage maintenance and repair orders</p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No work orders yet</p>
        </CardContent>
      </Card>
    </div>
  );
}

