import { Terminal } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-card-border bg-card sticky top-0 z-50 scanline-effect">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-8 h-8 text-primary" style={{ filter: 'drop-shadow(0 0 8px hsl(120 100% 50% / 0.5))' }} />
          <div>
            <h1 className="text-2xl font-bold tracking-wider" style={{ textShadow: '0 0 10px hsl(120 100% 50% / 0.5)' }}>
              RANAXHACK
            </h1>
            <p className="text-xs text-muted-foreground">INFO.APP v2.0</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ boxShadow: '0 0 8px hsl(120 100% 50% / 0.8)' }}></div>
          <span className="text-xs text-muted-foreground">ONLINE</span>
        </div>
      </div>
    </header>
  );
}
