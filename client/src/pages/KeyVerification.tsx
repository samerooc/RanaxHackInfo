import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Key } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface KeyVerificationProps {
  onVerified: (key: string, keyType: string) => void;
}

export default function KeyVerification({ onVerified }: KeyVerificationProps) {
  const [accessKey, setAccessKey] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    setError("");
    
    if (!accessKey.trim()) {
      setError("Please enter an access key");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/verify-key", { key: accessKey.trim() });
      const data = await response.json();
      
      if (response.ok) {
        onVerified(accessKey.trim(), data.keyType);
      } else {
        setError(data.error || "Invalid access key");
      }
    } catch (err: any) {
      setError("Failed to verify key. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleVerify();
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent animate-pulse"></div>
      
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>

      <Card className="w-full max-w-md relative z-10 border-2 border-primary/40 bg-black/90 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10 opacity-50"></div>
        
        <div className="relative p-8 space-y-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse"></div>
              <Shield className="w-20 h-20 text-primary relative z-10" style={{ filter: 'drop-shadow(0 0 10px hsl(120 100% 50% / 0.7))' }} />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-cyber tracking-wider font-mono">
              RANAXHACK
            </h1>
            <div className="flex items-center justify-center gap-2 text-cyan-400/80 font-mono text-sm">
              <Lock className="w-4 h-4" />
              <span>SECURE_ACCESS_REQUIRED</span>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="access-key" className="text-cyan-400 font-mono text-sm tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4" />
                <span>&gt;&gt; ACCESS_KEY</span>
              </Label>
              <div className="relative">
                <Input
                  id="access-key"
                  data-testid="input-access-key"
                  type="text"
                  placeholder="Enter your access key..."
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="bg-black/70 border-2 border-primary/40 font-mono text-primary focus:border-primary focus:ring-2 focus:ring-primary/30 pl-4 pr-4 py-3 placeholder:text-muted-foreground/50 uppercase"
                  style={{
                    boxShadow: '0 0 10px rgba(0, 255, 0, 0.1), inset 0 0 10px rgba(0, 255, 0, 0.05)'
                  }}
                />
                {accessKey && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                )}
              </div>
            </div>

            {error && (
              <div
                className="p-4 rounded-md bg-gradient-to-br from-destructive/20 to-destructive/5 border-2 border-destructive text-destructive text-sm font-mono"
                data-testid="error-verification"
                style={{
                  boxShadow: '0 0 15px rgba(255, 0, 0, 0.2)',
                }}
              >
                <div className="flex items-start gap-2">
                  <span className="font-bold flex-shrink-0">[!_ACCESS_DENIED_!]:</span>
                  <span className="flex-1">{error}</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleVerify}
              disabled={isLoading || !accessKey.trim()}
              className="w-full text-base font-mono tracking-wider relative overflow-hidden group"
              data-testid="button-verify-key"
              style={{
                background: isLoading ? 'hsl(120 100% 40%)' : 'linear-gradient(135deg, hsl(120 100% 40%), hsl(180 100% 40%))',
                boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              {isLoading ? (
                <>
                  <Lock className="w-5 h-5 mr-2 animate-spin" />
                  VERIFYING_ACCESS...
                </>
              ) : (
                <>
                  <span className="mr-2">[</span>
                  INITIALIZE_ACCESS
                  <span className="ml-2">]</span>
                </>
              )}
            </Button>
          </div>

          <div className="pt-4 border-t border-primary/20">
            <div className="text-xs text-cyan-400/60 font-mono space-y-1">
              <div className="flex items-start gap-2">
                <span className="text-primary flex-shrink-0">&gt;</span>
                <span>Master Key: Unlimited searches</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary flex-shrink-0">&gt;</span>
                <span>Limited Keys: 10 searches/day</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary flex-shrink-0">&gt;</span>
                <span>Permanent Key: Unrestricted access</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
      </Card>
    </div>
  );
}
