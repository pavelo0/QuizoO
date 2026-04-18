import { ClerkProvider } from '@clerk/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import './index.css';
import { router } from './router';
import { store } from './store/store';
import { ThemeProvider } from './theme/ThemeProvider';
import { Toaster } from 'react-hot-toast';

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!clerkPublishableKey) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is not set');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <Provider store={store}>
          <RouterProvider router={router} />
          <Toaster position="top-center" toastOptions={{ duration: 5000 }} />
        </Provider>
      </ClerkProvider>
    </ThemeProvider>
  </StrictMode>,
);
