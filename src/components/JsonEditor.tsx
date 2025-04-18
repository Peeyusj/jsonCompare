import React, { useEffect, useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
  matchedPaths?: string[];
}

const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange, placeholder, hasError = false, matchedPaths = [] }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);
  const [highlightedLines, setHighlightedLines] = useState<Set<number>>(new Set());

  useEffect(() => {
    updateLineNumbers();
    updateHighlightedLines();
  }, [value, matchedPaths]);

  const updateLineNumbers = () => {
    if (!value) {
      setLineNumbers([1]);
      return;
    }
    
    const lines = value.split('\n').length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
  };

  const updateHighlightedLines = () => {
    if (!value || !matchedPaths.length) {
      setHighlightedLines(new Set());
      return;
    }

    try {
      const lines = value.split('\n');
      const highlighted = new Set<number>();
      
      matchedPaths.forEach(path => {
        const parts = path.split('.');
        let searchStr = '';
        parts.forEach(part => {
          searchStr = searchStr ? `${searchStr}.${part}` : `"${part}"`;
          lines.forEach((line, index) => {
            if (line.includes(searchStr)) {
              highlighted.add(index + 1);
            }
          });
        });
      });

      setHighlightedLines(highlighted);
    } catch (e) {
      console.error('Error updating highlighted lines:', e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleCopy = async () => {
    if (!value) return;
    
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleFormatJson = () => {
    if (!value) return;
    
    try {
      const parsedJson = JSON.parse(value);
      const formattedJson = JSON.stringify(parsedJson, null, 2);
      onChange(formattedJson);
    } catch (error) {
      // Don't format if JSON is invalid
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className={`relative border ${hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg overflow-hidden h-[400px] transition-colors ${hasError ? 'bg-red-50 dark:bg-red-900/10' : 'bg-white dark:bg-gray-800'}`}>
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <button
          onClick={handleFormatJson}
          className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          title="Format JSON"
        >
          <span className="text-xs font-mono font-bold text-gray-600 dark:text-gray-300">{ };</span>
        </button>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-600 dark:text-gray-300" />}
        </button>
      </div>

      <div className="flex h-full">
        <div className="py-2 px-2 text-right bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 select-none font-mono text-xs">
          {lineNumbers.map(num => (
            <div key={num}>{num}</div>
          ))}
        </div>
        <div className="relative flex-1">
          {lineNumbers.map(num => (
            <div
              key={num}
              className={`absolute left-0 right-0 h-[20px] ${
                highlightedLines.has(num)
                  ? 'bg-green-50 dark:bg-green-900/10'
                  : ''
              }`}
              style={{ top: `${(num - 1) * 20}px` }}
            />
          ))}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className="relative w-full p-2 outline-none resize-none font-mono text-sm bg-transparent text-gray-800 dark:text-gray-200 min-h-full z-10"
            spellCheck="false"
            data-gramm="false"
          />
        </div>
      </div>
    </div>
  );
};

export default JsonEditor;