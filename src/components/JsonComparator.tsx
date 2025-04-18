import React, { useState, useEffect } from 'react';
import JsonEditor from './JsonEditor';
import ComparisonResults from './ComparisonResults';
import { compareJsons } from '../utils/jsonUtils';
import { ComparisonResult, EditorView, ComparisonOptions, ComparisonFactor } from '../types';
import { CheckSquare } from 'lucide-react';

const JsonComparator: React.FC = () => {
  const [leftJson, setLeftJson] = useState<string>('');
  const [rightJson, setRightJson] = useState<string>('');
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<{ left: string; right: string }>({ left: '', right: '' });
  const [viewMode, setViewMode] = useState<EditorView>('split');
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonOptions, setComparisonOptions] = useState<ComparisonOptions>({
    compareKeys: true,
    compareTypes: true,
    compareValues: true
  });

  useEffect(() => {
    if (leftJson && rightJson) {
      compareJsonObjects();
    } else {
      setComparisonResult(null);
    }
  }, [leftJson, rightJson, comparisonOptions]);

  const compareJsonObjects = () => {
    try {
      setIsComparing(true);
      setError({ left: '', right: '' });
      
      const leftObj = JSON.parse(leftJson);
      const rightObj = JSON.parse(rightJson);
      
      const result = compareJsons(leftObj, rightObj, comparisonOptions);
      setComparisonResult(result);
    } catch (e) {
      if (e instanceof SyntaxError) {
        try {
          JSON.parse(leftJson);
          setError({ left: '', right: e.message });
        } catch {
          try {
            JSON.parse(rightJson);
            setError({ left: e.message, right: '' });
          } catch {
            setError({ left: 'Invalid JSON', right: 'Invalid JSON' });
          }
        }
      }
      setComparisonResult(null);
    } finally {
      setIsComparing(false);
    }
  };

  const handleClearAll = () => {
    setLeftJson('');
    setRightJson('');
    setComparisonResult(null);
    setError({ left: '', right: '' });
  };

  const toggleComparisonFactor = (factor: ComparisonFactor) => {
    setComparisonOptions(prev => ({
      ...prev,
      [`compare${factor.charAt(0).toUpperCase() + factor.slice(1)}s`]: !prev[`compare${factor.charAt(0).toUpperCase() + factor.slice(1)}s`]
    }));
  };

  const loadSampleData = () => {
    const sampleLeft = JSON.stringify({
      name: "Product A",
      price: 19.99,
      category: "electronics",
      inStock: true,
      features: ["wireless", "bluetooth"],
      details: {
        weight: "300g",
        dimensions: {
          height: 10,
          width: 5,
          depth: 2
        }
      }
    }, null, 2);
    
    const sampleRight = JSON.stringify({
      name: "Product A",
      price: "19.99",
      inStock: false,
      features: ["wireless", "bluetooth", "waterproof"],
      details: {
        weight: 300,
        color: "black",
        dimensions: {
          height: 10,
          width: 5
        }
      }
    }, null, 2);
    
    setLeftJson(sampleLeft);
    setRightJson(sampleRight);
  };

  return (
    <div className="flex flex-col gap-6 fade-in">
      <div className="flex flex-col sm:flex-row gap-4 mb-2">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">JSON Payload Comparison</h2>
        <div className="flex gap-2 ml-auto">
          <div className="flex gap-2 items-center">
            <button
              onClick={() => toggleComparisonFactor('key')}
              className={`px-3 py-1 text-sm rounded flex items-center gap-1 transition-colors ${
                comparisonOptions.compareKeys
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {comparisonOptions.compareKeys && <CheckSquare size={14} />}
              Keys
            </button>
            <button
              onClick={() => toggleComparisonFactor('type')}
              className={`px-3 py-1 text-sm rounded flex items-center gap-1 transition-colors ${
                comparisonOptions.compareTypes
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {comparisonOptions.compareTypes && <CheckSquare size={14} />}
              Types
            </button>
            <button
              onClick={() => toggleComparisonFactor('value')}
              className={`px-3 py-1 text-sm rounded flex items-center gap-1 transition-colors ${
                comparisonOptions.compareValues
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {comparisonOptions.compareValues && <CheckSquare size={14} />}
              Values
            </button>
          </div>
          <button
            onClick={loadSampleData}
            className="px-3 py-1 text-sm rounded bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-800/50 transition-colors"
          >
            Load Sample
          </button>
          <button
            onClick={handleClearAll}
            className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Clear All
          </button>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as EditorView)}
            className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            <option value="split">Split View</option>
            <option value="horizontal">Horizontal View</option>
          </select>
        </div>
      </div>

      <div className={`grid ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2 gap-6' : 'grid-cols-1 gap-6'}`}>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-700 dark:text-gray-300">Source JSON</h3>
            {error.left && (
              <span className="text-sm text-red-500">{error.left}</span>
            )}
          </div>
          <JsonEditor
            value={leftJson}
            onChange={setLeftJson}
            placeholder="Paste your source JSON here..."
            hasError={!!error.left}
            matchedPaths={comparisonResult?.matchedPaths || []}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-700 dark:text-gray-300">Target JSON</h3>
            {error.right && (
              <span className="text-sm text-red-500">{error.right}</span>
            )}
          </div>
          <JsonEditor
            value={rightJson}
            onChange={setRightJson}
            placeholder="Paste your target JSON here..."
            hasError={!!error.right}
            matchedPaths={comparisonResult?.matchedPaths || []}
          />
        </div>
      </div>

      {comparisonResult && (
        <ComparisonResults result={comparisonResult} />
      )}

      {isComparing && (
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default JsonComparator;