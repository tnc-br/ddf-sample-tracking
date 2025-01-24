import { AxiosError } from "axios";
import { QueryClient } from "@tanstack/react-query";

const MAX_RETRIES = 3;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      //   retry: (failureCount, error: AxiosError) => {
      //     const statusCode = error?.response?.status ?? error?.status;

      //     return statusCode < 500 && failureCount < MAX_RETRIES;
      //   },
    },
  },
});

export default queryClient;
