"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Building2, Mail, Lock, UserPlus, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userRole, setUserRole] = useState<"manager" | "renter">("renter");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validate form
      if (!fullName.trim()) {
        setError("Full name is required");
        return;
      }
      if (!email.trim()) {
        setError("Email is required");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      // Simulate account creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store user data
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userRole', userRole);
      localStorage.setItem('userName', fullName);
      
      setSuccess(`Account created successfully! Welcome ${fullName}`);
      setTimeout(() => {
        router.push(`/dashboard?role=${userRole}`);
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!email.trim()) {
        setError("Please enter your email address");
        return;
      }

      // Call the password reset API
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setTimeout(() => {
          setMode("login");
          setEmail("");
          setSuccess("");
        }, 3000);
      } else {
        setError(data.error || "Failed to send reset email");
      }
      
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setError("");
    setSuccess("");
  };

  const switchMode = (newMode: "login" | "signup" | "forgot") => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 p-0 md:p-0 relative">
      {/* Left: Property image */}
      <div
        className="hidden md:block relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=60)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20" />
      </div>

      {/* Right: Auth card over subtle background */}
      <div className="relative flex items-center justify-center p-6 md:p-10">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800" />
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
          {/* Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => switchMode("login")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === "login" 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchMode("signup")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === "signup" 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Login Form */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="h-12 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="h-12 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>
              </div>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">{success}</p>
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
          )}

          {/* Signup Form */}
          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    className="h-12 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="h-12 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="userRole" className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Type
                </label>
                <select
                  id="userRole"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as "manager" | "renter")}
                  className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="renter">Renter/Tenant</option>
                  <option value="manager">Property Manager</option>
                </select>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Create a password (min 6 characters)"
                    className="h-12 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your password"
                    className="h-12 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>
              </div>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-200"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Reset Your Password</h3>
                <p className="text-sm text-gray-600">Enter your email address and we&apos;ll send you instructions to reset your password.</p>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="h-12 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>
              </div>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}
              <div className="flex gap-3">
                <Button 
                  type="button"
                  onClick={() => switchMode("login")}
                  variant="outline"
                  className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-200"
                >
                  {loading ? "Sending..." : "Send Reset Email"}
                </Button>
              </div>
            </form>
          )}

          {/* Test Accounts Info - Only show on login mode */}
          {mode === "login" && (
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
          )}
        </CardContent>
      </Card>
      </div>
      {/* Attribution */}
      <div className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/80 md:hidden">
        Product of Bradley Virtual Solutions, LLC
      </div>
    </div>
  );
}

