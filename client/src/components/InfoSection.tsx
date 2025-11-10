import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, LucideIcon, Loader2, Copy, Download } from "lucide-react";
import JsonViewer from "./JsonViewer";
import { useToast } from "@/hooks/use-toast";

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
  const [responseData, setResponseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const formatDataAsText = (data: any): string => {
    if (!data) return "";
    return JSON.stringify(data, null, 2);
  };

  const handleCopy = () => {
    const textData = formatDataAsText(responseData);
    navigator.clipboard.writeText(textData).then(() => {
      toast({
        title: "Copied!",
        description: "Data copied to clipboard",
      });
    });
  };

  const handleDownload = () => {
    const textData = formatDataAsText(responseData);
    const blob = new Blob([textData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}-data.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "Data downloaded successfully",
    });
  };

  const handleSubmit = async () => {
    setError("");
    setResponseData(null);

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
      setResponseData(response);
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

          {responseData && (
            <div className="mt-4 space-y-3">
              <div className="flex gap-2 justify-end">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="font-mono"
                  data-testid="button-copy"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  COPY
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="font-mono"
                  data-testid="button-download"
                >
                  <Download className="w-4 h-4 mr-2" />
                  DOWNLOAD
                </Button>
              </div>
              <div className="p-4 rounded-md bg-black/70 border-2 border-primary/40 font-mono text-xs overflow-x-auto max-h-96 overflow-y-auto">
                <pre className="text-green-400 whitespace-pre-wrap break-words">
                  {formatDataAsText(responseData)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}