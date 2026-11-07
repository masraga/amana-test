import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { toast } from './store/toastStore';
import { extractErrorMessage } from './utils/apiError';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
    mutations: {
      onError: (error) => {
        // Only show global toast if the error isn't a 422 (validation) or 403 (handled per-page)
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status !== 422 && status !== 403 && status !== 401) {
          toast.error(extractErrorMessage(error));
        }
      },
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
