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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image/Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%),
            linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.02) 50%, transparent 70%)
          `,
          backgroundSize: '400px 400px, 600px 600px, 200px 200px'
        }} />
        
        {/* Property-themed geometric shapes */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white/20 rounded-lg transform rotate-12"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border-2 border-white/20 rounded-lg transform -rotate-12"></div>
          <div className="absolute bottom-32 left-32 w-28 h-28 border-2 border-white/20 rounded-lg transform rotate-45"></div>
          <div className="absolute bottom-20 right-20 w-20 h-20 border-2 border-white/20 rounded-lg transform -rotate-45"></div>
          
          {/* Building silhouettes */}
          <div className="absolute top-1/4 left-1/4 w-16 h-24 bg-white/10 transform skew-x-12"></div>
          <div className="absolute top-1/3 right-1/4 w-12 h-20 bg-white/10 transform -skew-x-12"></div>
          <div className="absolute bottom-1/4 left-1/3 w-14 h-18 bg-white/10 transform skew-x-6"></div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-white/40 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse delay-2000"></div>
          <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse delay-500"></div>
        </div>
      </div>
      
      {/* Content */}
      <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full shadow-lg">
              <Building2 className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">RentFlow</CardTitle>
          <CardDescription className="text-gray-600 text-lg">Property & Trailer Park Management</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-200"
            >
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

