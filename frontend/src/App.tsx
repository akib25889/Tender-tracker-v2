import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { router } from './router';
import { TenderProvider } from './context/TenderContext';
import { queryClient } from './api/queryClient';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TenderProvider>
        <RouterProvider router={router} />
      </TenderProvider>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
}

export default App;
