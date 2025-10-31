"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, DollarSign, ClipboardCheck, TrendingUp, AlertTriangle, Home, FileText, Wrench, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { resolveClientRole } from "@/lib/auth";
import ScheduleTourModal from "@/components/modals/schedule-tour-modal";

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<'manager' | 'renter' | null>(null);
  const [loading, setLoading] = useState(true);
  const [tourOpen, setTourOpen] = useState(false);
  
  useEffect(() => {
    try {
      const role = resolveClientRole();
      setUserRole(role);
    } catch (error) {
      console.error("Error resolving role:", error);
      setUserRole('renter'); // Default fallback
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!userRole) return <div>Loading dashboard...</div>;

  if (userRole === 'renter') {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
              <p className="text-muted-foreground">Welcome back! Here&apos;s your rental overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Lease</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">Expires Dec 31, 2024</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,200</div>
              <p className="text-xs text-muted-foreground">Due on the 1st</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Open requests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Unread messages</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">December 2024</p>
                    <p className="text-sm text-muted-foreground">Dec 1, 2024</p>
                  </div>
                  <div className="text-green-600 font-medium">$1,200.00</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">November 2024</p>
                    <p className="text-sm text-muted-foreground">Nov 1, 2024</p>
                  </div>
                  <div className="text-green-600 font-medium">$1,200.00</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">October 2024</p>
                    <p className="text-sm text-muted-foreground">Oct 1, 2024</p>
                  </div>
                  <div className="text-green-600 font-medium">$1,200.00</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => {
                  try {
                    window?.localStorage?.setItem('userRole', 'renter');
                  } catch {}
                  window.location.href = '/dashboard/payments';
                }}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Pay Rent Online
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => {
                  try {
                    window?.localStorage?.setItem('userRole', 'renter');
                  } catch {}
                  window.location.href = '/dashboard/maintenance';
                }}
              >
                <Wrench className="mr-2 h-4 w-4" />
                Submit Maintenance Request
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => {
                  try {
                    window?.localStorage?.setItem('userRole', 'renter');
                  } catch {}
                  window.location.href = '/dashboard/my-lease';
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                View Lease Agreement
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => {
                  // Placeholder flow: route to properties where tours would be selected
                  try {
                    window?.localStorage?.setItem('userRole', 'renter');
                  } catch {}
                  setTourOpen(true);
                }}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Property Tour
              </Button>
            </CardContent>
          </Card>
        </div>
        <ScheduleTourModal open={tourOpen} onOpenChange={setTourOpen} />
      </div>
    );
  }

  // Manager Dashboard
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Property Management Dashboard</h1>
        <p className="text-muted-foreground">Manage your properties, tenants, and operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Total properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">Active tenants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$33,600</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Current occupancy</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">New lease signed</p>
                  <p className="text-sm text-muted-foreground">Unit 3B - John Smith</p>
                </div>
                <div className="text-sm text-muted-foreground">2 hours ago</div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Maintenance request</p>
                  <p className="text-sm text-muted-foreground">Unit 2A - Plumbing issue</p>
                </div>
                <div className="text-sm text-muted-foreground">4 hours ago</div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Rent payment received</p>
                  <p className="text-sm text-muted-foreground">Unit 1C - $1,200</p>
                </div>
                <div className="text-sm text-muted-foreground">1 day ago</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts & Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium">3 leases expiring soon</p>
                  <p className="text-sm text-muted-foreground">Renewal notices sent</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium">2 overdue payments</p>
                  <p className="text-sm text-muted-foreground">Late notices sent</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <ClipboardCheck className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">5 inspections pending</p>
                  <p className="text-sm text-muted-foreground">Scheduled for this week</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Use the navigation menu to access all features</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Collected</span>
                <span className="font-medium">$33,600</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Outstanding</span>
                <span className="font-medium text-red-600">$2,400</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Late Fees</span>
                <span className="font-medium">$150</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Occupied</span>
                <span className="font-medium">28 units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Vacant</span>
                <span className="font-medium">2 units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Maintenance</span>
                <span className="font-medium">1 unit</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Manager Dashboard
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Property Management Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s your property management overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">+3 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$33,600</div>
            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">93.3%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              <Building2 className="mr-2 h-4 w-4" />
              Add New Property
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Add New Tenant
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Create Lease
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <DollarSign className="mr-2 h-4 w-4" />
              Generate Invoice
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New tenant signed lease</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Maintenance request completed</p>
                  <p className="text-xs text-muted-foreground">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Payment received</p>
                  <p className="text-xs text-muted-foreground">6 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts & Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium">3 overdue payments</p>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
                </div>
              </div>
              <div className="flex items-center">
                <Wrench className="h-4 w-4 text-orange-500 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium">2 pending maintenance</p>
                  <p className="text-xs text-muted-foreground">Scheduled for today</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-blue-500 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium">1 lease renewal</p>
                  <p className="text-xs text-muted-foreground">Due next week</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Revenue</span>
                <span className="font-medium">$33,600</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Outstanding</span>
                <span className="font-medium text-red-600">$2,400</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Late Fees</span>
                <span className="font-medium">$150</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Occupied</span>
                <span className="font-medium">28 units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Vacant</span>
                <span className="font-medium">2 units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Maintenance</span>
                <span className="font-medium">1 unit</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

