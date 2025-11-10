import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import KeyVerification from "@/pages/KeyVerification";

function App() {
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
        {!accessKey ? (
          <KeyVerification onVerified={handleVerified} />
        ) : (
          <Home accessKey={accessKey} onLogout={handleLogout} />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
