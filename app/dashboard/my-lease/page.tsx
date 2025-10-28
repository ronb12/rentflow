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
      size: "2.3 MB",
      content: `
        RESIDENTIAL LEASE AGREEMENT
        
        This Lease Agreement ("Agreement") is entered into on January 1, 2024, between:
        
        LANDLORD: RentFlow Properties LLC
        Address: 123 Main Street, Anytown, ST 12345
        
        TENANT: John Doe
        Address: Sunset Apartments, Unit 3B, 123 Main Street, Anytown, ST 12345
        
        PROPERTY DESCRIPTION:
        The leased premises consist of a 2-bedroom, 1.5-bathroom apartment located at:
        Sunset Apartments, Unit 3B, 123 Main Street, Anytown, ST 12345
        
        LEASE TERMS:
        1. TERM: This lease shall commence on January 1, 2024, and terminate on December 31, 2024.
        2. RENT: Monthly rent of $1,200.00, due on the 1st of each month.
        3. SECURITY DEPOSIT: $1,200.00 (one month's rent)
        4. PET DEPOSIT: $300.00 (if applicable)
        5. LATE FEE: $50.00 if rent is not paid by the 5th of the month
        
        TENANT RESPONSIBILITIES:
        - Pay rent on time
        - Keep premises clean and sanitary
        - Notify landlord of needed repairs
        - No illegal activities on premises
        - No subletting without written permission
        
        LANDLORD RESPONSIBILITIES:
        - Maintain structural integrity
        - Provide heat, water, and electricity
        - Make necessary repairs
        - Respect tenant privacy
        
        UTILITIES:
        Tenant pays: Electricity, gas, internet
        Landlord pays: Water, sewer, trash
        
        PET POLICY:
        Maximum 2 pets allowed
        Pet deposit: $300 per pet
        Monthly pet rent: $25 per pet
        Breed restrictions apply
        
        TERMINATION:
        Either party may terminate with 30 days written notice
        Early termination fee may apply
        
        SIGNATURES:
        Landlord: _________________ Date: _________
        Tenant: _________________ Date: _________
      `
    },
    {
      id: "lease_month_to_month",
      name: "Month-to-Month Rental Agreement",
      type: "Month-to-Month",
      description: "Flexible monthly rental agreement",
      lastUpdated: "January 1, 2024",
      pages: 6,
      size: "1.8 MB",
      content: `
        MONTH-TO-MONTH RENTAL AGREEMENT
        
        This Month-to-Month Rental Agreement is entered into on January 1, 2024, between:
        
        LANDLORD: RentFlow Properties LLC
        TENANT: John Doe
        
        PROPERTY: Sunset Apartments, Unit 3B
        
        TERMS:
        1. RENTAL PERIOD: This agreement renews automatically each month
        2. RENT: $1,200.00 per month, due on the 1st
        3. SECURITY DEPOSIT: $1,200.00
        4. NOTICE TO TERMINATE: 30 days written notice required
        
        This agreement provides flexibility for both parties while maintaining
        standard rental protections and responsibilities.
      `
    },
    {
      id: "lease_commercial",
      name: "Commercial Lease Agreement",
      type: "Commercial",
      description: "Commercial property lease for business use",
      lastUpdated: "January 1, 2024",
      pages: 12,
      size: "3.1 MB",
      content: `
        COMMERCIAL LEASE AGREEMENT
        
        This Commercial Lease Agreement is entered into for business purposes:
        
        LANDLORD: RentFlow Properties LLC
        TENANT: [Business Name]
        
        PROPERTY: Commercial space at [Address]
        
        COMMERCIAL TERMS:
        1. BUSINESS USE: Premises may only be used for approved business purposes
        2. HOURS OF OPERATION: As specified in addendum
        3. SIGNAGE: Subject to landlord approval
        4. INSURANCE: Tenant must maintain commercial liability insurance
        5. COMPLIANCE: Must comply with all local business regulations
        
        This agreement includes additional commercial-specific terms and conditions
        for business operations and compliance requirements.
      `
    },
    {
      id: "lease_trailer_park",
      name: "Trailer Park Lot Lease",
      type: "Trailer Park",
      description: "Lot rental agreement for mobile homes",
      lastUpdated: "January 1, 2024",
      pages: 7,
      size: "2.0 MB",
      content: `
        TRAILER PARK LOT LEASE AGREEMENT
        
        This Trailer Park Lot Lease is entered into for mobile home lot rental:
        
        PARK OWNER: RentFlow Properties LLC
        TENANT: John Doe
        
        LOT: Trailer Park Lot #15
        
        LOT RENTAL TERMS:
        1. LOT RENT: $400.00 per month
        2. UTILITIES: Water and sewer included
        3. MOBILE HOME: Tenant owns mobile home
        4. LOT MAINTENANCE: Park owner maintains common areas
        5. PETS: Subject to park rules
        
        This agreement covers lot rental for mobile home placement and
        includes specific terms for trailer park living.
      `
    },
    {
      id: "lease_furnished",
      name: "Furnished Apartment Lease",
      type: "Furnished",
      description: "Lease agreement for furnished rental units",
      lastUpdated: "January 1, 2024",
      pages: 10,
      size: "2.7 MB",
      content: `
        FURNISHED APARTMENT LEASE AGREEMENT
        
        This Furnished Apartment Lease includes furniture and appliances:
        
        LANDLORD: RentFlow Properties LLC
        TENANT: John Doe
        
        PROPERTY: Furnished Unit 3B
        
        FURNISHED TERMS:
        1. FURNITURE INCLUDED: Living room, bedroom, dining room furniture
        2. APPLIANCES: Refrigerator, stove, dishwasher, washer/dryer
        3. DAMAGE DEPOSIT: Additional $500 for furniture protection
        4. INVENTORY: Detailed furniture inventory attached
        5. MAINTENANCE: Landlord maintains all furniture and appliances
        
        This agreement includes detailed inventory of all furniture and
        appliances provided with the rental unit.
      `
    }
  ];

  const handleDownload = (documentId: string, documentName: string) => {
    // Simulate PDF download
    const doc = leaseDocuments.find(d => d.id === documentId);
    if (doc) {
      // Create a blob with the content
      const blob = new Blob([doc.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentName.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    alert(`Downloading ${documentName}... (Sample content downloaded as text file)`);
  };

  const handleView = (documentId: string, documentName: string) => {
    // Simulate PDF viewing
    const doc = leaseDocuments.find(d => d.id === documentId);
    if (doc) {
      // Create a new window with the content
      const newWindow = window.open('', '_blank', 'width=800,height=600');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>${documentName}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .header { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
                pre { white-space: pre-wrap; font-family: inherit; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${documentName}</h1>
                <p><strong>Type:</strong> ${doc.type} | <strong>Pages:</strong> ${doc.pages} | <strong>Size:</strong> ${doc.size}</p>
                <p><strong>Last Updated:</strong> ${doc.lastUpdated}</p>
              </div>
              <pre>${doc.content}</pre>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    }
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
                    onClick={() => handleView(doc.id, doc.name)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc.id, doc.name)}
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