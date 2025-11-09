interface JsonViewerProps {
  data: any;
}

interface Token {
  value: string;
  type: 'key' | 'string' | 'number' | 'boolean' | 'null' | 'punctuation' | 'whitespace';
}

export default function JsonViewer({ data }: JsonViewerProps) {
  const tokenizeLine = (line: string): Token[] => {
    const tokens: Token[] = [];
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      
      // Whitespace
      if (/\s/.test(char)) {
        let whitespace = '';
        while (i < line.length && /\s/.test(line[i])) {
          whitespace += line[i];
          i++;
        }
        tokens.push({ value: whitespace, type: 'whitespace' });
        continue;
      }
      
      // Strings (keys or values)
      if (char === '"') {
        let str = '"';
        i++;
        while (i < line.length && line[i] !== '"') {
          if (line[i] === '\\' && i + 1 < line.length) {
            str += line[i] + line[i + 1];
            i += 2;
          } else {
            str += line[i];
            i++;
          }
        }
        if (i < line.length) {
          str += '"';
          i++;
        }
        
        // Check if it's a key (followed by ':')
        let j = i;
        while (j < line.length && /\s/.test(line[j])) j++;
        const isKey = j < line.length && line[j] === ':';
        
        tokens.push({ value: str, type: isKey ? 'key' : 'string' });
        continue;
      }
      
      // Numbers
      if (/[-\d]/.test(char)) {
        let num = '';
        while (i < line.length && /[-\d.]/.test(line[i])) {
          num += line[i];
          i++;
        }
        tokens.push({ value: num, type: 'number' });
        continue;
      }
      
      // Booleans and null
      if (line.slice(i).startsWith('true')) {
        tokens.push({ value: 'true', type: 'boolean' });
        i += 4;
        continue;
      }
      if (line.slice(i).startsWith('false')) {
        tokens.push({ value: 'false', type: 'boolean' });
        i += 5;
        continue;
      }
      if (line.slice(i).startsWith('null')) {
        tokens.push({ value: 'null', type: 'null' });
        i += 4;
        continue;
      }
      
      // Punctuation
      tokens.push({ value: char, type: 'punctuation' });
      i++;
    }
    
    return tokens;
  };
  
  const getTokenColor = (type: Token['type']): string => {
    switch (type) {
      case 'key': return 'text-cyan-400';
      case 'string': return 'text-primary';
      case 'number': return 'text-yellow-400';
      case 'boolean': return 'text-purple-400';
      case 'null': return 'text-red-400';
      case 'punctuation': return 'text-muted-foreground';
      case 'whitespace': return '';
      default: return 'text-foreground';
    }
  };
  
  const renderLine = (line: string, lineIndex: number) => {
    const tokens = tokenizeLine(line);
    
    return (
      <div key={lineIndex} className="hover:bg-primary/5 px-1 flex">
        <span className="text-cyan-400/50 select-none mr-3 flex-shrink-0">
          {String(lineIndex + 1).padStart(2, '0')}
        </span>
        <span className="flex-1">
          {tokens.map((token, idx) => (
            <span key={idx} className={getTokenColor(token.type)}>
              {token.value}
            </span>
          ))}
        </span>
      </div>
    );
  };
  
  const jsonString = JSON.stringify(data, null, 2);
  const lines = jsonString.split('\n');
  
  return (
    <pre className="whitespace-pre-wrap leading-relaxed font-mono text-sm">
      {lines.map((line, index) => renderLine(line, index))}
    </pre>
  );
}
