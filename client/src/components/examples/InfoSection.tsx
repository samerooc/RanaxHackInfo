import InfoSection from '../InfoSection';
import { Phone } from 'lucide-react';

export default function InfoSectionExample() {
  return (
    <div className="p-8 bg-background">
      <InfoSection
        icon={Phone}
        title="Number Info"
        description="Lookup information for any 10-digit phone number"
        inputLabel="Phone Number"
        inputPlaceholder="Enter 10-digit number (e.g., 9876543210)"
        validationPattern={/^\d{10}$/}
        validationMessage="Please enter a valid 10-digit phone number"
        onSubmit={async (value) => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return {
            number: value,
            carrier: "Example Carrier",
            location: "Example Location",
            status: "Active"
          };
        }}
      />
    </div>
  );
}
