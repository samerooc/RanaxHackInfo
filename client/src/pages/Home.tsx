import { Phone, Users, Send, Instagram, Wallet } from "lucide-react";
import InfoSection from "@/components/InfoSection";
import Header from "@/components/Header";

export default function Home() {
  const handleNumberInfo = async (phoneNumber: string) => {
    const response = await fetch(`https://numapi.anshapi.workers.dev/?num=${phoneNumber}`);
    if (!response.ok) {
      throw new Error("Failed to fetch phone number information");
    }
    return await response.json();
  };

  const handleFamilyDetail = async (aadhaar: string) => {
    const response = await fetch(`https://addartofamily.vercel.app/fetch?aadhaar=${aadhaar}&key=fxt`);
    if (!response.ok) {
      throw new Error("Failed to fetch family details");
    }
    return await response.json();
  };

  return (
    <div className="min-h-screen bg-background scanline-effect">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2" style={{ textShadow: '0 0 10px hsl(120 100% 50% / 0.3)' }}>
            INFORMATION LOOKUP SYSTEM
          </h2>
          <p className="text-muted-foreground">
            Secure data retrieval interface // Access restricted information
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
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

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          <p>© 2024 RanaxHack Info App // Authorized access only</p>
          <p className="mt-1">All queries are logged and monitored</p>
        </footer>
      </main>
    </div>
  );
}
