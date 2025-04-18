export type DifferenceType = 'missing' | 'type' | 'value';

export type ComparisonFactor = 'key' | 'type' | 'value';

export interface Difference {
  path: string;
  type: DifferenceType;
  details: string;
  sourceValue?: any;
  targetValue?: any;
}

export interface ComparisonResult {
  differences: Difference[];
  matchPercentage: number;
  totalKeysSource: number;
  totalKeysTarget: number;
  matchedPaths: string[];
}

export type EditorView = 'split' | 'horizontal';

export interface ComparisonOptions {
  compareKeys: boolean;
  compareTypes: boolean;
  compareValues: boolean;
}