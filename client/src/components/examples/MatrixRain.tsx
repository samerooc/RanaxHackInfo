import MatrixRain from '../MatrixRain';

export default function MatrixRainExample() {
  return (
    <div className="relative h-screen bg-background">
      <MatrixRain />
      <div className="relative z-10 flex items-center justify-center h-full">
        <p className="text-primary text-2xl font-mono">Matrix Rain Effect</p>
      </div>
    </div>
  );
}
