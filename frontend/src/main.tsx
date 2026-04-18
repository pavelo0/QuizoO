import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import './index.css';
import { router } from './router';
import { store } from './store/store';
import { ThemeProvider } from './theme/ThemeProvider';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <Provider store={store}>
          <RouterProvider router={router} />
          <Toaster position="top-center" toastOptions={{ duration: 5000 }} />
        </Provider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
