import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, LucideIcon, Loader2 } from "lucide-react";
import JsonViewer from "./JsonViewer";

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
    <Card className="border-2 glow-border transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden group">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between text-left relative hover-elevate"
        data-testid={`button-toggle-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 rounded-md bg-gradient-to-br from-primary/20 to-cyan-500/10 border-2 border-primary/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent animate-pulse"></div>
            <Icon className="w-7 h-7 text-primary relative z-10" style={{ filter: 'drop-shadow(0 0 6px hsl(120 100% 50% / 0.5))' }} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1 text-cyber tracking-wide font-mono">{title}</h3>
            <p className="text-sm text-cyan-400/70 font-mono">&gt; {description}</p>
          </div>
        </div>
        <div className="relative z-10">
          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-primary animate-pulse" />
          ) : (
            <ChevronDown className="w-6 h-6 text-primary" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-5 border-t-2 border-primary/20 pt-5 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="space-y-3">
            <Label htmlFor={`input-${title.toLowerCase().replace(/\s+/g, '-')}`} className="text-cyan-400 font-mono text-sm tracking-wider flex items-center gap-2">
              <span className="text-primary">&gt;&gt;</span> {inputLabel}
            </Label>
            <div className="relative">
              <Input
                id={`input-${title.toLowerCase().replace(/\s+/g, '-')}`}
                data-testid={`input-${title.toLowerCase().replace(/\s+/g, '-')}`}
                placeholder={inputPlaceholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-black/50 border-2 border-primary/40 font-mono text-primary focus:border-primary focus:ring-2 focus:ring-primary/30 pl-4 pr-4 py-3 placeholder:text-muted-foreground/50"
                disabled={isLoading}
                style={{
                  boxShadow: '0 0 10px rgba(0, 255, 0, 0.1), inset 0 0 10px rgba(0, 255, 0, 0.05)'
                }}
              />
              {inputValue && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary animate-pulse"></div>
              )}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !inputValue}
            className="w-full text-base font-mono tracking-wider relative overflow-hidden group"
            data-testid={`button-submit-${title.toLowerCase().replace(/\s+/g, '-')}`}
            style={{
              background: isLoading ? 'hsl(120 100% 40%)' : 'linear-gradient(135deg, hsl(120 100% 40%), hsl(180 100% 40%))',
              boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                PROCESSING_DATA...
              </>
            ) : (
              <>
                <span className="mr-2">[</span>
                EXECUTE_QUERY
                <span className="ml-2">]</span>
              </>
            )}
          </Button>

          {error && (
            <div
              className="p-4 rounded-md bg-gradient-to-br from-destructive/20 to-destructive/5 border-2 border-destructive text-destructive text-sm font-mono relative overflow-hidden"
              data-testid={`error-${title.toLowerCase().replace(/\s+/g, '-')}`}
              style={{
                boxShadow: '0 0 15px rgba(255, 0, 0, 0.2)',
                animation: 'glitch 0.3s ease-in-out'
              }}
            >
              <div className="flex items-start gap-2">
                <span className="font-bold text-base flex-shrink-0">[!_ERROR_!]:</span>
                <span className="flex-1">{error}</span>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <Label className="text-cyan-400 font-mono text-sm tracking-wider flex items-center gap-2">
                <span className="text-primary">&gt;&gt;</span> SYSTEM_RESPONSE:
              </Label>
              <div
                className="p-5 rounded-md bg-black/70 border-2 border-primary/40 max-h-96 overflow-auto relative"
                data-testid={`result-${title.toLowerCase().replace(/\s+/g, '-')}`}
                style={{
                  boxShadow: '0 0 20px rgba(0, 255, 0, 0.15), inset 0 0 20px rgba(0, 255, 0, 0.05)'
                }}
              >
                <JsonViewer data={result} />
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
