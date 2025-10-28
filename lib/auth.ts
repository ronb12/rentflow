// Simple role detection based on email
export function getUserRole(email: string): 'manager' | 'renter' {
  if (email === 'manager@example.com') {
    return 'manager';
  }
  return 'renter';
}

export function getUserDisplayName(email: string): string {
  if (email === 'manager@example.com') {
    return 'Property Manager';
  }
  return 'Tenant';
}

// Get current user role from localStorage or session
export function getCurrentUserRole(): 'manager' | 'renter' {
  if (typeof window !== 'undefined') {
    const userEmail = localStorage.getItem('userEmail') || 'renter@example.com';
    return getUserRole(userEmail);
  }
  return 'renter'; // Default to renter
}

// Parse role from URL if present
export function getRoleFromUrl(): 'manager' | 'renter' | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role');
    if (role === 'manager' || role === 'renter') return role;
    return null;
  } catch {
    return null;
  }
}

// Determine role on client preferring URL, then localStorage
export function resolveClientRole(): 'manager' | 'renter' {
  if (typeof window === 'undefined') return 'renter';
  const fromUrl = getRoleFromUrl();
  if (fromUrl) return fromUrl;
  return getCurrentUserRole();
}
