"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Plus } from "lucide-react";

export default function MessagesPage() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageStatus, setMessageStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessageStatus("");

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId: 'tenant_1',
          message: message,
          status: 'sent'
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessageStatus("Message sent successfully!");
        setMessage(""); // Reset form
      } else {
        setMessageStatus(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessageStatus("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">Communicate with your property management team.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Conversation with Property Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 h-96 overflow-y-auto">
              <div className="flex justify-end">
                <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                  <p>Hi, I wanted to ask about the parking situation for guests.</p>
                  <p className="text-xs opacity-75 mt-1">Dec 20, 2024 2:30 PM</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg max-w-xs">
                  <p>Hello! Guests can park in the visitor spaces near the entrance. Please let us know if you need additional parking.</p>
                  <p className="text-xs text-gray-500 mt-1">Dec 20, 2024 2:45 PM</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                  <p>Thank you! Also, when will the maintenance request for my kitchen faucet be completed?</p>
                  <p className="text-xs opacity-75 mt-1">Dec 20, 2024 3:15 PM</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg max-w-xs">
                  <p>Our maintenance team is scheduled to visit tomorrow morning between 9-11 AM. They&apos;ll contact you directly when they arrive.</p>
                  <p className="text-xs text-gray-500 mt-1">Dec 20, 2024 3:30 PM</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <form onSubmit={handleSubmit} className="flex space-x-2 w-full">
                <input 
                  type="text" 
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
                <Button type="submit" disabled={isSubmitting}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
            {messageStatus && (
              <div className={`mt-2 p-2 rounded-md text-sm ${messageStatus.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {messageStatus}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              View All Messages
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Property Manager</p>
                <p className="text-sm text-muted-foreground">Sarah Johnson</p>
                <p className="text-sm text-muted-foreground">sarah@rentflow.com</p>
                <p className="text-sm text-muted-foreground">(555) 123-4567</p>
              </div>
              <div>
                <p className="font-medium">Maintenance Coordinator</p>
                <p className="text-sm text-muted-foreground">Mike Rodriguez</p>
                <p className="text-sm text-muted-foreground">mike@rentflow.com</p>
                <p className="text-sm text-muted-foreground">(555) 987-6543</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
