import React, { useState } from 'react';
import { ComparisonResult, DifferenceType } from '../types';
import { ChevronRight, ChevronDown, AlertCircle, InfoIcon } from 'lucide-react';

interface ComparisonResultsProps {
  result: ComparisonResult;
}

const ComparisonResults: React.FC<ComparisonResultsProps> = ({ result }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    missingKeys: true,
    typeMismatches: true,
    summary: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getIconForDifference = (type: DifferenceType) => {
    switch (type) {
      case 'missing':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'type':
        return <InfoIcon size={16} className="text-amber-500" />;
      default:
        return null;
    }
  };

  const getColorForDifference = (type: DifferenceType) => {
    switch (type) {
      case 'missing':
        return 'text-red-600 dark:text-red-400';
      case 'type':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  const renderDifferenceItem = (path: string, type: DifferenceType, details: string) => (
    <li 
      key={path} 
      className="py-2 px-3 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
      <div className="flex items-start gap-2">
        {getIconForDifference(type)}
        <div className="flex-1">
          <div className={`font-mono text-sm ${getColorForDifference(type)}`}>
            {path}
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{details}</p>
        </div>
      </div>
    </li>
  );

  const hasMissingKeys = result.differences.some(d => d.type === 'missing');
  const hasTypeMismatches = result.differences.some(d => d.type === 'type');

  return (
    <div className="mt-6 grid gap-6 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        {/* Summary Section */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            className="w-full px-4 py-3 flex items-center justify-between text-left"
            onClick={() => toggleSection('summary')}
          >
            <h3 className="font-medium text-gray-800 dark:text-gray-200">
              Comparison Summary
            </h3>
            {expandedSections.summary ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
          
          {expandedSections.summary && (
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/30 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Total Differences</p>
                  <p className="text-2xl font-semibold mt-1 text-gray-900 dark:text-gray-100">{result.differences.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Missing Keys</p>
                  <p className="text-2xl font-semibold mt-1 text-red-600 dark:text-red-400">
                    {result.differences.filter(d => d.type === 'missing').length}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Type Mismatches</p>
                  <p className="text-2xl font-semibold mt-1 text-amber-600 dark:text-amber-400">
                    {result.differences.filter(d => d.type === 'type').length}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Match Percentage</p>
                  <p className="text-2xl font-semibold mt-1 text-green-600 dark:text-green-400">
                    {result.matchPercentage}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Missing Keys Section */}
        {hasMissingKeys && (
          <div className="border-b border-gray-200 dark:border-gray-700">
            <button
              className="w-full px-4 py-3 flex items-center justify-between text-left"
              onClick={() => toggleSection('missingKeys')}
            >
              <h3 className="font-medium text-gray-800 dark:text-gray-200">
                Missing Keys <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                  {result.differences.filter(d => d.type === 'missing').length}
                </span>
              </h3>
              {expandedSections.missingKeys ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            
            {expandedSections.missingKeys && (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {result.differences
                  .filter(d => d.type === 'missing')
                  .map(d => renderDifferenceItem(d.path, d.type, d.details))}
              </ul>
            )}
          </div>
        )}

        {/* Type Mismatches Section */}
        {hasTypeMismatches && (
          <div className="border-b border-gray-200 dark:border-gray-700">
            <button
              className="w-full px-4 py-3 flex items-center justify-between text-left"
              onClick={() => toggleSection('typeMismatches')}
            >
              <h3 className="font-medium text-gray-800 dark:text-gray-200">
                Type Mismatches <span className="ml-2 px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                  {result.differences.filter(d => d.type === 'type').length}
                </span>
              </h3>
              {expandedSections.typeMismatches ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            
            {expandedSections.typeMismatches && (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {result.differences
                  .filter(d => d.type === 'type')
                  .map(d => renderDifferenceItem(d.path, d.type, d.details))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonResults;