"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Plus, AlertCircle, Calendar } from "lucide-react";

export default function MaintenancePage() {
  const [issueType, setIssueType] = useState("plumbing");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch('/api/maintenance-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId: 'tenant_1',
          issueType: issueType,
          description: description,
          priority: priority,
          status: 'pending'
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage("Maintenance request submitted successfully!");
        setDescription(""); // Reset form
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage("Failed to submit maintenance request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Maintenance Requests</h1>
        <p className="text-muted-foreground">Submit and track maintenance requests for your rental unit.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Submit New Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-medium">Issue Type</label>
                <select 
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  required
                >
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="hvac">HVAC</option>
                  <option value="appliance">Appliance</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea 
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md h-24"
                  placeholder="Describe the issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <select 
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              {message && (
                <div className={`p-3 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {message}
                </div>
              )}
              <Button type="submit" disabled={isSubmitting} className="w-full">
                <Wrench className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium">Kitchen Faucet Leak</p>
                  <p className="text-sm text-muted-foreground">Submitted Dec 15, 2024</p>
                </div>
                <div className="text-yellow-600 font-medium">In Progress</div>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Light Bulb Replacement</p>
                  <p className="text-sm text-muted-foreground">Submitted Dec 10, 2024</p>
                </div>
                <div className="text-green-600 font-medium">Completed</div>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Heating Issue</p>
                  <p className="text-sm text-muted-foreground">Submitted Dec 5, 2024</p>
                </div>
                <div className="text-blue-600 font-medium">Scheduled</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <div>
                <p className="font-medium">For emergency maintenance issues:</p>
                <p className="text-lg font-semibold text-red-600">(555) 123-4567</p>
                <p className="text-sm text-muted-foreground">Available 24/7</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
