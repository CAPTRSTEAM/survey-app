// Simple test to check React module loading
console.log('Testing React module loading...');

try {
  // Try to import React from the index file
  const { R } = await import('./index.DPzfUFWB.js');
  console.log('Successfully imported R:', R);
  console.log('R.useState available:', typeof R.useState);
  console.log('R.useEffect available:', typeof R.useEffect);
} catch (error) {
  console.error('Failed to import R:', error);
}

try {
  // Try to access window.React
  console.log('window.React available:', window.React);
  if (window.React) {
    console.log('window.React.useState available:', typeof window.React.useState);
    console.log('window.React.useEffect available:', typeof window.React.useEffect);
  }
} catch (error) {
  console.error('Failed to access window.React:', error);
}
