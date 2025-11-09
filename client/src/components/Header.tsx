import { Terminal, Activity } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const [glitchText, setGlitchText] = useState("RANAXHACK");
  
  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const originalText = "RANAXHACK";
    
    const glitch = () => {
      let iterations = 0;
      const interval = setInterval(() => {
        setGlitchText(prev => 
          prev.split("").map((char, index) => {
            if (index < iterations) {
              return originalText[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          }).join("")
        );
        
        if (iterations >= originalText.length) {
          clearInterval(interval);
        }
        iterations += 1/3;
      }, 30);
    };
    
    const timer = setInterval(glitch, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="border-b-2 glow-border bg-card/80 backdrop-blur-md sticky top-0 z-50 scanline-effect">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Terminal className="w-10 h-10 text-primary text-cyber" />
              <div className="absolute inset-0 blur-lg opacity-50 bg-primary"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-[0.2em] text-cyber font-mono">
                {glitchText}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                <p className="text-xs text-cyan-400 font-mono tracking-wider">
                  INFORMATION_RETRIEVAL_SYSTEM.v2.0
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-md bg-primary/10 border border-primary/30 glow-border">
            <div 
              className="h-2 w-2 rounded-full bg-primary" 
              style={{ 
                animation: 'glow-pulse 2s ease-in-out infinite',
              }}
            ></div>
            <span className="text-sm font-mono text-primary tracking-wider">SYSTEM_ONLINE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
