const examListeners = new Map();

export const subscribeToExamPresence = (examId, listener) => {
  const key = String(examId);
  const listeners = examListeners.get(key) || new Set();
  listeners.add(listener);
  examListeners.set(key, listeners);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) examListeners.delete(key);
  };
};

export const publishExamPresence = (examId, event) => {
  const listeners = examListeners.get(String(examId));
  if (!listeners) return;
  for (const listener of listeners) listener(event);
};
