"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, CreditCard, Globe, Trash2 } from "lucide-react";
import AddPaymentMethodModal from "@/components/add-payment-method-modal";
import EditPaymentMethodModal from "@/components/edit-payment-method-modal";

export default function SettingsPage() {
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "renter@example.com",
    phone: "555-123-4567",
    emergencyContact: "Jane Doe",
    emergencyPhone: "555-987-6543"
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    maintenanceUpdates: true,
    paymentReminders: true,
    leaseRenewals: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "private",
    dataSharing: false,
    marketingEmails: false
  });

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: "card_1",
      type: "credit_card" as const,
      name: "Visa ending in 1234",
      expiry: "12/25",
      isDefault: true
    },
    {
      id: "bank_1", 
      type: "bank_account" as const,
      name: "Bank Account ending in 5678",
      accountType: "Checking",
      isDefault: false
    }
  ]);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Profile updated successfully!");
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Password change request sent to your email!");
  };

  const handleAddPaymentMethod = (newMethod: any) => {
    setPaymentMethods(prev => [...prev, newMethod]);
  };

  const handleEditPaymentMethod = (methodId: string, updatedMethod: any) => {
    setPaymentMethods(prev => 
      prev.map(method => 
        method.id === methodId ? updatedMethod : method
      )
    );
  };

  const handleDeletePaymentMethod = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (method && confirm(`Are you sure you want to delete "${method.name}"?`)) {
      setPaymentMethods(prev => prev.filter(m => m.id !== methodId));
      
      // If we deleted the default method, set another as default
      if (method.isDefault && paymentMethods.length > 1) {
        const remainingMethods = paymentMethods.filter(m => m.id !== methodId);
        if (remainingMethods.length > 0) {
          setPaymentMethods(prev => 
            prev.map(m => ({ ...m, isDefault: m.id === remainingMethods[0].id }))
          );
        }
      }
    }
  };

  const handleSetDefault = (methodId: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({ ...method, isDefault: method.id === methodId }))
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-muted-foreground">Manage your account settings and preferences.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={profileData.emergencyContact}
                  onChange={(e) => setProfileData({...profileData, emergencyContact: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={profileData.emergencyPhone}
                  onChange={(e) => setProfileData({...profileData, emergencyPhone: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full">
                Update Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch
                id="emailNotifications"
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="smsNotifications">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates via text message</p>
              </div>
              <Switch
                id="smsNotifications"
                checked={notifications.smsNotifications}
                onCheckedChange={(checked) => setNotifications({...notifications, smsNotifications: checked})}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceUpdates">Maintenance Updates</Label>
                <p className="text-sm text-muted-foreground">Get notified about maintenance requests</p>
              </div>
              <Switch
                id="maintenanceUpdates"
                checked={notifications.maintenanceUpdates}
                onCheckedChange={(checked) => setNotifications({...notifications, maintenanceUpdates: checked})}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="paymentReminders">Payment Reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminded about upcoming payments</p>
              </div>
              <Switch
                id="paymentReminders"
                checked={notifications.paymentReminders}
                onCheckedChange={(checked) => setNotifications({...notifications, paymentReminders: checked})}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="leaseRenewals">Lease Renewals</Label>
                <p className="text-sm text-muted-foreground">Get notified about lease renewal options</p>
              </div>
              <Switch
                id="leaseRenewals"
                checked={notifications.leaseRenewals}
                onCheckedChange={(checked) => setNotifications({...notifications, leaseRenewals: checked})}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Change Password</h4>
              <form onSubmit={handlePasswordChange} className="space-y-3">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button type="submit" className="w-full">
                  Change Password
                </Button>
              </form>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Add an extra layer of security to your account
              </p>
              <Button variant="outline" className="w-full">
                Enable 2FA
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="profileVisibility">Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">Control who can see your profile</p>
              </div>
              <select 
                className="px-3 py-1 border rounded-md"
                value={privacy.profileVisibility}
                onChange={(e) => setPrivacy({...privacy, profileVisibility: e.target.value})}
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
                <option value="tenants-only">Tenants Only</option>
              </select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dataSharing">Data Sharing</Label>
                <p className="text-sm text-muted-foreground">Allow data sharing for service improvement</p>
              </div>
              <Switch
                id="dataSharing"
                checked={privacy.dataSharing}
                onCheckedChange={(checked) => setPrivacy({...privacy, dataSharing: checked})}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketingEmails">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">Receive promotional emails</p>
              </div>
              <Switch
                id="marketingEmails"
                checked={privacy.marketingEmails}
                onCheckedChange={(checked) => setPrivacy({...privacy, marketingEmails: checked})}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No payment methods added yet</p>
              </div>
            ) : (
              paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 flex-1">
                    <CreditCard className={`h-6 w-6 ${method.type === 'credit_card' ? 'text-blue-500' : 'text-green-500'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{method.name}</p>
                        {method.isDefault && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Default</span>
                        )}
                      </div>
                      {method.expiry && <p className="text-sm text-muted-foreground">Expires {method.expiry}</p>}
                      {method.accountType && <p className="text-sm text-muted-foreground">{method.accountType} Account</p>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!method.isDefault && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Set Default
                      </Button>
                    )}
                    <EditPaymentMethodModal 
                      paymentMethod={method}
                      onUpdatePaymentMethod={handleEditPaymentMethod}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeletePaymentMethod(method.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete payment method"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
            
            <AddPaymentMethodModal onAddPaymentMethod={handleAddPaymentMethod} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
