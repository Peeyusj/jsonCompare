import { ComparisonResult, Difference, ComparisonOptions } from '../types';

/**
 * Compares two JSON objects and identifies missing keys and type differences
 */
export function compareJsons(source: any, target: any, options: ComparisonOptions): ComparisonResult {
  const differences: Difference[] = [];
  const sourceKeyPaths = getAllKeyPaths(source);
  const targetKeyPaths = getAllKeyPaths(target);
  const matchedPaths: string[] = [];
  
  // Check for missing keys in target and type/value differences
  for (const path of sourceKeyPaths) {
    const sourceValue = getValueByPath(source, path);
    const targetValue = getValueByPath(target, path);
    let isMatched = true;
    
    if (targetValue === undefined && options.compareKeys) {
      differences.push({
        path,
        type: 'missing',
        details: `Key exists in source but missing in target`,
        sourceValue,
        targetValue: undefined
      });
      isMatched = false;
    } else {
      if (options.compareTypes && typeof sourceValue !== typeof targetValue) {
        differences.push({
          path,
          type: 'type',
          details: `Type mismatch: source is ${typeof sourceValue}, target is ${typeof targetValue}`,
          sourceValue,
          targetValue
        });
        isMatched = false;
      }
      
      if (options.compareValues && JSON.stringify(sourceValue) !== JSON.stringify(targetValue)) {
        differences.push({
          path,
          type: 'value',
          details: `Value mismatch: source is ${JSON.stringify(sourceValue)}, target is ${JSON.stringify(targetValue)}`,
          sourceValue,
          targetValue
        });
        isMatched = false;
      }
    }

    if (isMatched) {
      matchedPaths.push(path);
    }
  }
  
  // Check for missing keys in source
  if (options.compareKeys) {
    for (const path of targetKeyPaths) {
      const sourceValue = getValueByPath(source, path);
      const targetValue = getValueByPath(target, path);
      
      if (sourceValue === undefined) {
        differences.push({
          path,
          type: 'missing',
          details: `Key exists in target but missing in source`,
          sourceValue: undefined,
          targetValue
        });
      }
    }
  }

  // Calculate match percentage
  const totalUniqueKeys = new Set([...sourceKeyPaths, ...targetKeyPaths]).size;
  const matchCount = totalUniqueKeys - differences.length;
  const matchPercentage = totalUniqueKeys === 0 
    ? 100 
    : Math.round((matchCount / totalUniqueKeys) * 100);

  return {
    differences,
    matchPercentage,
    totalKeysSource: sourceKeyPaths.length,
    totalKeysTarget: targetKeyPaths.length,
    matchedPaths
  };
}

/**
 * Gets all key paths in a JSON object
 */
function getAllKeyPaths(obj: any, currentPath: string = '', result: string[] = []): string[] {
  if (!obj || typeof obj !== 'object') {
    return result;
  }

  for (const key in obj) {
    const newPath = currentPath ? `${currentPath}.${key}` : key;
    result.push(newPath);
    
    if (obj[key] && typeof obj[key] === 'object') {
      getAllKeyPaths(obj[key], newPath, result);
    }
  }

  return result;
}

/**
 * Gets a value from an object by its dot-notation path
 */
function getValueByPath(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[part];
  }
  
  return current;
}

/**
 * Format JSON string with proper indentation
 */
export function formatJson(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    return jsonString;
  }
}

/**
 * Check if a string is valid JSON
 */
export function isValidJson(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (e) {
    return false;
  }
}