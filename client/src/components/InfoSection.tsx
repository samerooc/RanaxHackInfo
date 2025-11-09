import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, LucideIcon, Loader2 } from "lucide-react";

interface InfoSectionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  inputLabel: string;
  inputPlaceholder: string;
  validationPattern?: RegExp;
  validationMessage?: string;
  onSubmit?: (value: string) => Promise<any>;
  isPlaceholder?: boolean;
}

export default function InfoSection({
  icon: Icon,
  title,
  description,
  inputLabel,
  inputPlaceholder,
  validationPattern,
  validationMessage = "Invalid input format",
  onSubmit,
  isPlaceholder = false,
}: InfoSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    setError("");
    setResult(null);

    if (validationPattern && !validationPattern.test(inputValue)) {
      setError(validationMessage);
      return;
    }

    if (isPlaceholder) {
      setError("This feature is coming soon. API integration pending.");
      return;
    }

    if (!onSubmit) {
      setError("No handler configured for this section.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await onSubmit(inputValue);
      setResult(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <Card className="border-2 border-card-border hover-elevate transition-all duration-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between text-left"
        data-testid={`button-toggle-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-md bg-primary/10 border border-primary/30">
            <Icon className="w-6 h-6 text-primary" style={{ filter: 'drop-shadow(0 0 4px hsl(120 100% 50% / 0.3))' }} />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-primary" />
        ) : (
          <ChevronDown className="w-5 h-5 text-primary" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4 border-t border-card-border/50 pt-4">
          <div className="space-y-2">
            <Label htmlFor={`input-${title.toLowerCase().replace(/\s+/g, '-')}`} className="text-foreground">
              {inputLabel}
            </Label>
            <Input
              id={`input-${title.toLowerCase().replace(/\s+/g, '-')}`}
              data-testid={`input-${title.toLowerCase().replace(/\s+/g, '-')}`}
              placeholder={inputPlaceholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-background border-input font-mono"
              disabled={isLoading}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !inputValue}
            className="w-full"
            data-testid={`button-submit-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Execute Query"
            )}
          </Button>

          {error && (
            <div
              className="p-4 rounded-md bg-destructive/10 border border-destructive text-destructive text-sm font-mono"
              data-testid={`error-${title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span className="font-bold">[ERROR]:</span> {error}
            </div>
          )}

          {result && (
            <div className="space-y-2">
              <Label className="text-foreground">Response:</Label>
              <div
                className="p-4 rounded-md bg-background border border-card-border max-h-96 overflow-auto font-mono text-sm"
                data-testid={`result-${title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <pre className="whitespace-pre-wrap text-primary">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
