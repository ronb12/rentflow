"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Simple auth for demo - accept test accounts
      if (
        (email === "renter@example.com" && password === "Renter!234") ||
        (email === "manager@example.com" && password === "Manager!234") ||
        // Allow any email/password for demo purposes
        (email && password)
      ) {
        // Store user email and role in localStorage for role detection
        const role = email === "manager@example.com" ? "manager" : "renter";
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userRole', role);
        router.push(`/dashboard?role=${role}`);
      } else {
        setError("Invalid credentials. Use renter@example.com/Renter!234 or manager@example.com/Manager!234");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl">RentFlow</CardTitle>
          <CardDescription>Property & Trailer Park Management</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="h-12"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="h-12"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full h-12">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-center text-muted-foreground mb-2">
              Test Accounts:
            </p>
            <div className="space-y-2 text-xs">
              <p>
                <strong>Renter:</strong> renter@example.com / Renter!234
              </p>
              <p>
                <strong>Manager:</strong> manager@example.com / Manager!234
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

