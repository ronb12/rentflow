"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { resolveClientRole } from "@/lib/auth";

interface ProtectedPageProps {
  children: React.ReactNode;
  allowedRoles: ('manager' | 'renter')[];
}

export default function ProtectedPage({ children, allowedRoles }: ProtectedPageProps) {
  const router = useRouter();

  useEffect(() => {
    const userRole = resolveClientRole();
    
    if (!allowedRoles.includes(userRole)) {
      // Redirect to dashboard if user doesn't have access
      router.push('/dashboard');
    }
  }, [allowedRoles, router]);

  return <>{children}</>;
}
