/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary security and obfuscation utilities.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

/**
 * Code obfuscation utilities for production builds
 * Helps protect proprietary IFRS 16 algorithms from reverse engineering
 */

// Simple string obfuscation for sensitive data
export function obfuscateString(str: string): string {
  if (process.env.NODE_ENV === 'development') {
    return str; // Don't obfuscate in development
  }
  
  return btoa(str).split('').reverse().join('');
}

export function deobfuscateString(obfuscated: string): string {
  if (process.env.NODE_ENV === 'development') {
    return obfuscated; // Don't deobfuscate in development
  }
  
  return atob(obfuscated.split('').reverse().join(''));
}

// Function name obfuscation
const OBFUSCATED_FUNCTIONS = new Map<string, string>();

export function obfuscateFunctionName(originalName: string): string {
  if (process.env.NODE_ENV === 'development') {
    return originalName;
  }
  
  if (!OBFUSCATED_FUNCTIONS.has(originalName)) {
    const obfuscated = `_${Math.random().toString(36).substr(2, 9)}`;
    OBFUSCATED_FUNCTIONS.set(originalName, obfuscated);
  }
  
  return OBFUSCATED_FUNCTIONS.get(originalName) || originalName;
}

// Protect critical calculation functions
export function protectCalculationFunction<T extends (...args: any[]) => any>(
  fn: T,
  functionName: string
): T {
  if (process.env.NODE_ENV === 'development') {
    return fn;
  }
  
  // Add anti-debugging measures
  const protectedFn = ((...args: Parameters<T>) => {
    // Check for dev tools
    const start = Date.now();
    debugger; // This will be removed in production by minifiers
    
    const result = fn(...args);
    
    // Detect debugging attempts
    const end = Date.now();
    if (end - start > 1000) { // Suspiciously long execution
      console.warn('Debugging detected');
    }
    
    return result;
  }) as T;
  
  // Obfuscate function name
  Object.defineProperty(protectedFn, 'name', {
    value: obfuscateFunctionName(functionName),
    writable: false
  });
  
  return protectedFn;
}

// Environment variable obfuscation
export function getSecureEnvVar(key: string): string | undefined {
  const value = process.env[key];
  
  if (!value) return undefined;
  
  // Additional security checks
  if (value.includes('localhost') || value.includes('127.0.0.1')) {
    console.warn('Development environment detected in production');
  }
  
  return value;
}

// Anti-tampering measures
export function addTamperProtection(obj: any, criticalMethods: string[]): void {
  if (process.env.NODE_ENV === 'development') return;
  
  for (const method of criticalMethods) {
    if (typeof obj[method] === 'function') {
      const originalMethod = obj[method];
      
      obj[method] = function(...args: any[]) {
        // Check if method has been tampered with
        if (obj[method] !== originalMethod) {
          throw new Error('Tampering detected');
        }
        
        return originalMethod.apply(this, args);
      };
    }
  }
}

// Source code protection
export function addSourceProtection(): void {
  if (process.env.NODE_ENV === 'development') return;
  
  // Disable right-click context menu
  if (typeof window !== 'undefined') {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
    
    // Disable F12, Ctrl+Shift+I, Ctrl+U
    document.addEventListener('keydown', (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
      }
    });
  }
}

// Watermark for screenshots
export function addWatermark(): void {
  if (process.env.NODE_ENV === 'development') return;
  
  if (typeof window !== 'undefined') {
    const watermark = document.createElement('div');
    watermark.innerHTML = '© 2025 Contabilease - Propriedade Intelectual Protegida';
    watermark.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 9999;
      pointer-events: none;
      opacity: 0.7;
    `;
    document.body.appendChild(watermark);
  }
}
