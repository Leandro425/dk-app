import { Route, Routes } from 'react-router-dom'
import { HomepageRoutes } from '../features/Homepage'
import I18nextProvider from '../providers/I18nextProvider'
import AppRoutes from './AppRoutes'
import QueryClientProvider from '../providers/QueryClientProvider'
import ThemeProvider from '../context/theme/ThemeProvider'
import NotFoundPage from '../components/NotFoundPage'

const RootRoutes = () => {
    return (
        <I18nextProvider>
            <QueryClientProvider>
                <ThemeProvider>
                    <Routes>
                        <Route
                            path="/*"
                            element={<HomepageRoutes />}
                        />
                        <Route
                            path="/app/*"
                            element={<AppRoutes />}
                        />
                        <Route
                            path="*"
                            element={<NotFoundPage />}
                        />
                    </Routes>
                </ThemeProvider>
            </QueryClientProvider>
        </I18nextProvider>
    )
}

export default RootRoutes
