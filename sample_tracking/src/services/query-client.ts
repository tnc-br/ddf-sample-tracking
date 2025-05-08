import { AxiosError } from 'axios'
import { QueryClient } from '@tanstack/react-query'

const MAX_RETRIES = 3

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // retry: (failureCount, error: any) => {
      //   const statusCode = error?.response?.status ?? error?.status
      //   const isValidStatusCode =
      //     !statusCode ||
      //     statusCode >= 500 ||
      //     statusCode === 401 ||
      //     statusCode === 403

      //   const shouldRetry = isValidStatusCode && failureCount < MAX_RETRIES

      //   return shouldRetry
      // },
    },
  },
})

export default queryClient
