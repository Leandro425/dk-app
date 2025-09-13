import { Route, Routes } from 'react-router-dom'
import SupabaseProvider from '../context/supabase/SupabaseProvider'
import { AuthRoutes } from '../features/Auth'
import DashboardRoutes from '../features/Dashboard/routes/DashboardRoute'
import SupabaseAuthGuard from '../components/guards/SupabaseAuthGuard'
import SupervisorProvider from '../context/user/SupervisorProvider'
import NotFoundPage from '../components/NotFoundPage'

const AppRoutes = () => {
    return (
        <SupabaseProvider>
            <Routes>
                <Route
                    path="/auth/*"
                    element={<AuthRoutes />}
                />
                <Route
                    path="/dashboard/*"
                    element={
                        <SupabaseAuthGuard>
                            <SupervisorProvider>
                                <DashboardRoutes />
                            </SupervisorProvider>
                        </SupabaseAuthGuard>
                    }
                />
                <Route
                    path="*"
                    element={<NotFoundPage />}
                />
            </Routes>
        </SupabaseProvider>
    )
}

export default AppRoutes
