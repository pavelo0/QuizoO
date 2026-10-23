import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverStub;

localStorage.setItem('quizo.locale', 'en');

afterEach(() => {
  cleanup();
  localStorage.clear();
  localStorage.setItem('quizo.locale', 'en');
});
