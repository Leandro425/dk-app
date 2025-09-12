import { QueryClient, QueryClientProvider as QueryClientProviderLib } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false, // default: true
            retry: (failureCount, error) => {
                if (failureCount >= 3) return false
                if (Math.round((error.response?.status || 0) / 100) === 4) return false
                return true
            },
        },
    },
})

const QueryClientProvider = ({ children }) => {
    return (
        <QueryClientProviderLib client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProviderLib>
    )
}

export default QueryClientProvider
