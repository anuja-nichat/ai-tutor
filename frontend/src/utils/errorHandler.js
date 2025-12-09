// Global error handler to suppress WebChannel errors
export const setupErrorHandling = () => {
  if (typeof window === 'undefined') return;

  // Store original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  // Override console.error to filter out WebChannel errors
  console.error = (...args) => {
    const message = args.join(' ');
    
    // Filter out WebChannel and Firestore RPC errors
    if (message.includes('WebChannel') || 
        message.includes('Firestore') && message.includes('RPC') ||
        message.includes('Write/channe') ||
        message.includes('transport errored')) {
      // Log as warning instead of error to reduce noise
      originalConsoleWarn('Firestore connection issue (suppressed):', ...args);
      return;
    }
    
    // Log all other errors normally
    originalConsoleError.apply(console, args);
  };

  // Override console.warn to filter out repetitive Firestore warnings
  console.warn = (...args) => {
    const message = args.join(' ');
    
    // Filter out repetitive Firestore warnings
    if (message.includes('WebChannelConnection RPC') ||
        message.includes('transport errored')) {
      // Only log once every 10 seconds to avoid spam
      const now = Date.now();
      if (!window.lastFirestoreWarning || now - window.lastFirestoreWarning > 10000) {
        originalConsoleWarn('Firestore connection issue:', ...args);
        window.lastFirestoreWarning = now;
      }
      return;
    }
    
    // Log all other warnings normally
    originalConsoleWarn.apply(console, args);
  };

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    if (error && (
      error.message?.includes('WebChannel') ||
      error.message?.includes('Firestore') ||
      error.code === 'unavailable'
    )) {
      console.warn('Suppressed Firestore promise rejection:', error);
      event.preventDefault(); // Prevent the error from showing in console
    }
  });

  console.log('Error handling setup complete - WebChannel errors will be suppressed');
};
