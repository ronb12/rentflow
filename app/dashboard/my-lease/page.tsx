"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, DollarSign, Home } from "lucide-react";

export default function MyLeasePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Lease Agreement</h1>
        <p className="text-muted-foreground">View your current lease details and documents.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lease Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Property</p>
                <p className="text-lg">Sunset Apartments Unit 3B</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Rent</p>
                <p className="text-lg font-semibold">$1,200.00</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lease Start</p>
                <p className="text-lg">January 1, 2024</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lease End</p>
                <p className="text-lg">December 31, 2024</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Security Deposit</p>
                <p className="text-lg">$1,200.00</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pet Deposit</p>
                <p className="text-lg">$300.00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lease Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Lease Agreement (PDF)
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Property Rules & Regulations
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Move-in Checklist
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Pet Policy Agreement
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lease Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Payment Terms</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Rent is due on the 1st of each month</li>
                  <li>• Late fee of $50.00 applies after 5-day grace period</li>
                  <li>• Acceptable payment methods: Online portal, check, money order</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Property Rules</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• No smoking inside the unit</li>
                  <li>• Maximum 2 pets allowed with additional deposit</li>
                  <li>• Quiet hours: 10 PM - 7 AM</li>
                  <li>• No modifications without written permission</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Maintenance</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Report maintenance issues through the tenant portal</li>
                  <li>• Emergency maintenance: Call (555) 123-4567</li>
                  <li>• Tenant responsible for minor repairs under $50</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
