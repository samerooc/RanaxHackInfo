import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import Home from "@/pages/Home";
import KeyVerification from "@/pages/KeyVerification";
import AdminPage from "@/pages/admin";

function App() {
  const [location, setLocation] = useLocation();
  const [accessKey, setAccessKey] = useState<string | null>(null);
  const [keyType, setKeyType] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const revalidateStoredKey = async () => {
      const storedKey = localStorage.getItem("ranaxhack_access_key");
      const storedKeyType = localStorage.getItem("ranaxhack_key_type");
      
      if (storedKey && storedKeyType) {
        try {
          const response = await fetch("/api/verify-key", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: storedKey }),
          });

          if (response.ok) {
            const data = await response.json();
            setAccessKey(storedKey);
            setKeyType(data.keyType);
          } else {
            localStorage.removeItem("ranaxhack_access_key");
            localStorage.removeItem("ranaxhack_key_type");
          }
        } catch (error) {
          console.error("Revalidation failed:", error);
          localStorage.removeItem("ranaxhack_access_key");
          localStorage.removeItem("ranaxhack_key_type");
        }
      }
      setIsVerifying(false);
    };

    revalidateStoredKey();
  }, []);

  const handleVerified = (key: string, type: string) => {
    localStorage.setItem("ranaxhack_access_key", key);
    localStorage.setItem("ranaxhack_key_type", type);
    setAccessKey(key);
    setKeyType(type);
  };

  const handleLogout = () => {
    localStorage.removeItem("ranaxhack_access_key");
    localStorage.removeItem("ranaxhack_key_type");
    setAccessKey(null);
    setKeyType("");
    setLocation("/");
  };

  if (isVerifying) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-primary font-mono text-lg animate-pulse">
              VERIFYING_ACCESS...
            </div>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="min-h-screen bg-background">
          {accessKey && location !== "/" && (
            <nav className="border-b px-4 py-2 flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setLocation("/")} data-testid="button-nav-home">
                  Home
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/admin")} data-testid="button-nav-admin">
                  Admin
                </Button>
              </div>
              <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
                Logout
              </Button>
            </nav>
          )}
          
          <Switch>
            <Route path="/admin">
              {!accessKey ? (
                <KeyVerification onVerified={handleVerified} />
              ) : (
                <AdminPage />
              )}
            </Route>
            <Route path="/">
              {!accessKey ? (
                <KeyVerification onVerified={handleVerified} />
              ) : (
                <Home accessKey={accessKey} onLogout={handleLogout} />
              )}
            </Route>
          </Switch>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
