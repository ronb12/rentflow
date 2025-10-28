"use client";

import { useEffect, useState } from "react";

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // Only log in development
          if (process.env.NODE_ENV === 'development') {
            console.log("Service Worker registered:", registration.scope);
          }
        })
        .catch((error) => {
          // Only log errors in development
          if (process.env.NODE_ENV === 'development') {
            console.log("Service Worker registration failed:", error);
          }
        });

      // Listen for updates
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });
    }

    // Track online/offline status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    updateOnlineStatus();

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('PWA: Install prompt available');
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Handle successful installation
    window.addEventListener("appinstalled", () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`User response to install prompt: ${outcome}`);
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <>
      {/* Online/Offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50">
          You are offline. Syncing when connection is restored...
        </div>
      )}

      {/* Install prompt */}
      {isInstallable && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm">Install RentFlow for better experience</span>
            <button 
              onClick={handleInstall} 
              className="bg-white text-primary px-3 py-1 rounded text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Install
            </button>
          </div>
        </div>
      )}

      {children}
    </>
  );
}

