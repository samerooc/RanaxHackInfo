import JsonViewer from '../JsonViewer';

export default function JsonViewerExample() {
  const sampleData = {
    status: "success",
    user: {
      name: "John Doe",
      age: 30,
      active: true,
      role: null,
      score: 95.5
    },
    items: ["item1", "item2", "item3"]
  };

  return (
    <div className="p-8 bg-background">
      <div className="max-w-2xl mx-auto p-5 rounded-md bg-black/70 border-2 border-primary/40">
        <JsonViewer data={sampleData} />
      </div>
    </div>
  );
}
