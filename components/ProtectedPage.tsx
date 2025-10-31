"use client";

import { ReactNode } from "react";

interface ProtectedPageProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedPage({ children, allowedRoles }: ProtectedPageProps) {
  // In production, implement actual role checking logic
  return <>{children}</>;
}

