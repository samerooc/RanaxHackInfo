import { Phone, Users, Send, Instagram, Wallet, Shield, Lock } from "lucide-react";
import InfoSection from "@/components/InfoSection";
import Header from "@/components/Header";
import MatrixRain from "@/components/MatrixRain";

export default function Home() {
  const handleNumberInfo = async (phoneNumber: string) => {
    const response = await fetch(`/api/number-info/${phoneNumber}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch phone number information");
    }
    return await response.json();
  };

  const handleFamilyDetail = async (aadhaar: string) => {
    const response = await fetch(`/api/family-detail/${aadhaar}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch family details");
    }
    return await response.json();
  };

  return (
    <div className="min-h-screen bg-background scanline-effect cyber-grid relative">
      <MatrixRain />
      <Header />
      
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="mb-12 text-center relative">
          <div className="inline-flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-cyan-400 animate-pulse" />
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-cyber font-mono tracking-wider" style={{ textShadow: '0 0 20px hsl(120 100% 50% / 0.5), 0 0 40px hsl(180 100% 50% / 0.3)' }}>
            INFORMATION_LOOKUP_SYSTEM
          </h2>
          <div className="flex items-center justify-center gap-2 text-cyan-400/70 font-mono text-sm mb-2">
            <span className="animate-pulse">[</span>
            <span>SECURE_DATA_RETRIEVAL_INTERFACE</span>
            <span className="animate-pulse">]</span>
          </div>
          <p className="text-muted-foreground font-mono text-xs">
            &gt; Access_Level: AUTHORIZED // Session_Active: TRUE
          </p>
          <div className="mt-6 h-px w-64 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent" style={{
            boxShadow: '0 0 10px rgba(0, 255, 0, 0.5)'
          }}></div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <InfoSection
            icon={Phone}
            title="Number Info"
            description="Lookup information for any 10-digit phone number"
            inputLabel="Phone Number"
            inputPlaceholder="Enter 10-digit number (e.g., 9876543210)"
            validationPattern={/^\d{10}$/}
            validationMessage="Please enter a valid 10-digit phone number"
            onSubmit={handleNumberInfo}
          />

          <InfoSection
            icon={Users}
            title="Family Detail"
            description="Retrieve family information using Aadhaar number"
            inputLabel="Aadhaar Number"
            inputPlaceholder="Enter 12-digit Aadhaar number"
            validationPattern={/^\d{12}$/}
            validationMessage="Please enter a valid 12-digit Aadhaar number"
            onSubmit={handleFamilyDetail}
          />

          <InfoSection
            icon={Send}
            title="Telegram Info"
            description="Query Telegram user information"
            inputLabel="Telegram Username or ID"
            inputPlaceholder="Enter username (e.g., @username) or User ID"
            isPlaceholder={true}
          />

          <InfoSection
            icon={Instagram}
            title="Instagram ID to Number"
            description="Convert Instagram profile to associated phone number"
            inputLabel="Instagram Username"
            inputPlaceholder="Enter Instagram username (without @)"
            isPlaceholder={true}
          />

          <InfoSection
            icon={Wallet}
            title="UPI Info"
            description="Lookup UPI ID and transaction details"
            inputLabel="UPI ID"
            inputPlaceholder="Enter UPI ID (e.g., user@paytm)"
            isPlaceholder={true}
          />
        </div>

        <footer className="mt-16 text-center text-xs text-muted-foreground font-mono">
          <div className="mb-4 h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          <div className="space-y-2">
            <p className="flex items-center justify-center gap-2">
              <span className="text-primary">©</span> 
              <span>2024_RANAXHACK_INFO_APP</span>
              <span className="text-primary">//</span>
              <span className="text-cyan-400/50">AUTHORIZED_ACCESS_ONLY</span>
            </p>
            <p className="text-destructive/70 text-[10px] tracking-widest">
              [ ! ] ALL_QUERIES_LOGGED_AND_MONITORED [ ! ]
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <div className="h-1 w-1 rounded-full bg-primary animate-pulse"></div>
              <div className="h-1 w-1 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-1 w-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
