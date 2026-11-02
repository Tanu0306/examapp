// Simple toast utility for the Teacher Portal
// Minimal implementation using native alert for demonstration.
// In a real app you might replace this with a proper toast component.

export const toast = {
  success: (msg) => {
    alert(`✅ ${msg}`);
    console.log(`Toast success: ${msg}`);
  },
  error: (msg) => {
    alert(`❌ ${msg}`);
    console.error(`Toast error: ${msg}`);
  },
  info: (msg) => {
    alert(`ℹ️ ${msg}`);
    console.info(`Toast info: ${msg}`);
  },
};

export default toast;

