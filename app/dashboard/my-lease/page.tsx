"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye } from "lucide-react";

export default function MyLeasePage() {
  const leaseDocuments = [
    {
      id: "lease_standard",
      name: "Standard Residential Lease Agreement",
      type: "Residential",
      description: "12-month lease with standard terms and conditions",
      lastUpdated: "January 1, 2024",
      pages: 8,
      size: "2.3 MB"
    },
    {
      id: "lease_month_to_month",
      name: "Month-to-Month Rental Agreement",
      type: "Month-to-Month",
      description: "Flexible monthly rental agreement",
      lastUpdated: "January 1, 2024",
      pages: 6,
      size: "1.8 MB"
    },
    {
      id: "lease_commercial",
      name: "Commercial Lease Agreement",
      type: "Commercial",
      description: "Commercial property lease for business use",
      lastUpdated: "January 1, 2024",
      pages: 12,
      size: "3.1 MB"
    },
    {
      id: "lease_trailer_park",
      name: "Trailer Park Lot Lease",
      type: "Trailer Park",
      description: "Lot rental agreement for mobile homes",
      lastUpdated: "January 1, 2024",
      pages: 7,
      size: "2.0 MB"
    },
    {
      id: "lease_furnished",
      name: "Furnished Apartment Lease",
      type: "Furnished",
      description: "Lease agreement for furnished rental units",
      lastUpdated: "January 1, 2024",
      pages: 10,
      size: "2.7 MB"
    }
  ];

  const handleDownload = (documentId: string) => {
    // Simulate document download
    alert(`Downloading ${documentId}... (This would download the actual PDF)`);
  };

  const handleView = (documentId: string) => {
    // Simulate document viewing
    alert(`Opening ${documentId} for viewing... (This would open a PDF viewer)`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Lease Agreement</h1>
      <p className="text-muted-foreground">View details of your current lease and related documents.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Lease Status</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">Expires: December 31, 2024</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monthly Rent:</span>
                <span className="font-medium">$1,200.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Security Deposit:</span>
                <span className="font-medium">$1,200.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pet Deposit:</span>
                <span className="font-medium">$300.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Late Fee:</span>
                <span className="font-medium">$50.00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Property Details</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">Property:</p>
                <p className="text-muted-foreground">Sunset Apartments, Unit 3B</p>
              </div>
              <div>
                <p className="text-sm font-medium">Address:</p>
                <p className="text-muted-foreground">123 Main Street, Anytown, ST 12345</p>
              </div>
              <div>
                <p className="text-sm font-medium">Lease Term:</p>
                <p className="text-muted-foreground">January 1, 2024 - December 31, 2024 (12 months)</p>
              </div>
              <div>
                <p className="text-sm font-medium">Property Type:</p>
                <p className="text-muted-foreground">2 Bedroom, 1.5 Bath Apartment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lease Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaseDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-medium">{doc.name}</h3>
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                      <span>Type: {doc.type}</span>
                      <span>Pages: {doc.pages}</span>
                      <span>Size: {doc.size}</span>
                      <span>Updated: {doc.lastUpdated}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(doc.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc.id)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lease Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Rent Payment</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Rent is due on the 1st of each month</li>
                <li>• Late fees apply after the 5th of the month</li>
                <li>• Acceptable payment methods: Online portal, check, money order</li>
                <li>• Returned check fee: $25.00</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Property Maintenance</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Tenant responsible for minor maintenance</li>
                <li>• Landlord responsible for major repairs</li>
                <li>• Emergency maintenance available 24/7</li>
                <li>• Maintenance requests submitted through tenant portal</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Pet Policy</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Maximum 2 pets allowed</li>
                <li>• Pet deposit: $300 per pet</li>
                <li>• Monthly pet rent: $25 per pet</li>
                <li>• Breed restrictions apply</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Utilities & Services</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Tenant pays: Electricity, gas, internet</li>
                <li>• Landlord pays: Water, sewer, trash</li>
                <li>• Cable TV available for additional fee</li>
                <li>• Parking space included</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}