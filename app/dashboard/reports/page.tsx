"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, DollarSign, TrendingUp, Download, Calendar, Building2, Users, AlertTriangle, CheckCircle, Filter } from "lucide-react";

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    startDate: "2024-01-01",
    endDate: "2024-12-31"
  });

  // Sample data for reports
  const rentRollData = [
    { unit: "1A", tenant: "John Doe", rent: 1200, status: "Current", leaseStart: "2024-01-01", leaseEnd: "2024-12-31" },
    { unit: "1B", tenant: "Jane Smith", rent: 1100, status: "Current", leaseStart: "2024-02-01", leaseEnd: "2025-01-31" },
    { unit: "2A", tenant: "Mike Johnson", rent: 1300, status: "Overdue", leaseStart: "2024-01-15", leaseEnd: "2024-12-15" },
    { unit: "2B", tenant: "Sarah Wilson", rent: 1150, status: "Current", leaseStart: "2024-03-01", leaseEnd: "2025-02-28" },
    { unit: "3A", tenant: "David Brown", rent: 1250, status: "Current", leaseStart: "2024-01-01", leaseEnd: "2024-12-31" },
    { unit: "3B", tenant: "Lisa Davis", rent: 1200, status: "Overdue", leaseStart: "2024-02-15", leaseEnd: "2025-01-15" },
    { unit: "4A", tenant: "Robert Miller", rent: 1350, status: "Current", leaseStart: "2024-01-01", leaseEnd: "2024-12-31" },
    { unit: "4B", tenant: "Emily Garcia", rent: 1100, status: "Current", leaseStart: "2024-03-15", leaseEnd: "2025-02-15" }
  ];

  const delinquencyData = [
    { tenant: "Mike Johnson", unit: "2A", amount: 1300, daysOverdue: 15, lastPayment: "2024-11-15", status: "Severe" },
    { tenant: "Lisa Davis", unit: "3B", amount: 1200, daysOverdue: 8, lastPayment: "2024-11-22", status: "Moderate" },
    { tenant: "Tom Wilson", unit: "5A", amount: 1400, daysOverdue: 30, lastPayment: "2024-10-30", status: "Severe" },
    { tenant: "Anna Martinez", unit: "5B", amount: 1250, daysOverdue: 5, lastPayment: "2024-11-25", status: "Minor" }
  ];

  const occupancyData = [
    { property: "Main Building", totalUnits: 8, occupiedUnits: 7, vacantUnits: 1, occupancyRate: 87.5 },
    { property: "Annex Building", totalUnits: 6, occupiedUnits: 6, vacantUnits: 0, occupancyRate: 100 },
    { property: "Garden Apartments", totalUnits: 4, occupiedUnits: 3, vacantUnits: 1, occupancyRate: 75 },
    { property: "Townhomes", totalUnits: 6, occupiedUnits: 5, vacantUnits: 1, occupancyRate: 83.3 }
  ];

  const generateReport = (reportType: string) => {
    setSelectedReport(reportType);
    
    switch (reportType) {
      case 'rentRoll':
        setReportData(rentRollData);
        break;
      case 'delinquency':
        setReportData(delinquencyData);
        break;
      case 'occupancy':
        setReportData(occupancyData);
        break;
    }
  };

  const exportReport = (format: 'pdf' | 'csv') => {
    if (!selectedReport || !reportData) return;
    
    // Simulate export functionality
    const fileName = `${selectedReport}_report_${new Date().toISOString().split('T')[0]}.${format}`;
    console.log(`Exporting ${selectedReport} report as ${format}:`, fileName);
    
    // In a real implementation, this would generate and download the file
    alert(`Report exported as ${fileName}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Current": return "bg-green-100 text-green-800";
      case "Overdue": return "bg-red-100 text-red-800";
      case "Severe": return "bg-red-100 text-red-800";
      case "Moderate": return "bg-yellow-100 text-yellow-800";
      case "Minor": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalRent = rentRollData.reduce((sum, unit) => sum + unit.rent, 0);
  const overdueAmount = delinquencyData.reduce((sum, tenant) => sum + tenant.amount, 0);
  const totalOccupancy = occupancyData.reduce((sum, prop) => sum + prop.occupancyRate, 0) / occupancyData.length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Property Management Reports</h1>
        <p className="text-muted-foreground">Generate comprehensive reports for rent roll, delinquency, and occupancy analysis.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Monthly Rent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From all units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${overdueAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOccupancy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Portfolio average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Across all properties</p>
          </CardContent>
        </Card>
      </div>

      {/* Date Range Filter */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Generation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Rent Roll Report</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Comprehensive rent roll showing all units, tenants, rent amounts, and lease status.
            </p>
            <Button onClick={() => generateReport('rentRoll')} className="w-full">
              Generate Rent Roll
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <CardTitle>Delinquency Report</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View tenants with overdue payments, amounts owed, and days past due.
            </p>
            <Button onClick={() => generateReport('delinquency')} className="w-full">
              Generate Delinquency Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Occupancy Report</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Property occupancy rates, vacant units, and occupancy trends.
            </p>
            <Button onClick={() => generateReport('occupancy')} className="w-full">
              Generate Occupancy Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Report Display */}
      {selectedReport && reportData && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                {selectedReport === 'rentRoll' && <FileText className="h-5 w-5" />}
                {selectedReport === 'delinquency' && <DollarSign className="h-5 w-5" />}
                {selectedReport === 'occupancy' && <TrendingUp className="h-5 w-5" />}
                {selectedReport === 'rentRoll' && 'Rent Roll Report'}
                {selectedReport === 'delinquency' && 'Delinquency Report'}
                {selectedReport === 'occupancy' && 'Occupancy Report'}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => exportReport('pdf')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
                <Button variant="outline" onClick={() => exportReport('csv')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedReport === 'rentRoll' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Unit</th>
                      <th className="text-left p-2">Tenant</th>
                      <th className="text-left p-2">Monthly Rent</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Lease Start</th>
                      <th className="text-left p-2">Lease End</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((unit: any, index: number) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{unit.unit}</td>
                        <td className="p-2">{unit.tenant}</td>
                        <td className="p-2">${unit.rent.toLocaleString()}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(unit.status)}`}>
                            {unit.status}
                          </span>
                        </td>
                        <td className="p-2">{unit.leaseStart}</td>
                        <td className="p-2">{unit.leaseEnd}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedReport === 'delinquency' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Tenant</th>
                      <th className="text-left p-2">Unit</th>
                      <th className="text-left p-2">Amount Owed</th>
                      <th className="text-left p-2">Days Overdue</th>
                      <th className="text-left p-2">Last Payment</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((tenant: any, index: number) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{tenant.tenant}</td>
                        <td className="p-2">{tenant.unit}</td>
                        <td className="p-2">${tenant.amount.toLocaleString()}</td>
                        <td className="p-2">{tenant.daysOverdue}</td>
                        <td className="p-2">{tenant.lastPayment}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
                            {tenant.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedReport === 'occupancy' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Property</th>
                      <th className="text-left p-2">Total Units</th>
                      <th className="text-left p-2">Occupied</th>
                      <th className="text-left p-2">Vacant</th>
                      <th className="text-left p-2">Occupancy Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((property: any, index: number) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{property.property}</td>
                        <td className="p-2">{property.totalUnits}</td>
                        <td className="p-2 text-green-600">{property.occupiedUnits}</td>
                        <td className="p-2 text-red-600">{property.vacantUnits}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${property.occupancyRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{property.occupancyRate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

