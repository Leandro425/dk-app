import { Route, Routes } from 'react-router-dom'
import SupabaseProvider from '../context/supabase/SupabaseProvider'
import { AuthRoutes } from '../features/Auth'
import DashboardRoutes from '../features/Dashboard/routes/DashboardRoute'
import SupabaseAuthGuard from '../components/guards/SupabaseAuthGuard'
import SupervisorProvider from '../context/user/SupervisorProvider'
import NotFoundPage from '../components/NotFoundPage'
import AdminGuard from '../components/guards/AdminGuard'
import AdminRoutes from '../features/Admin'

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
                    path="/admin/*"
                    element={
                        <SupabaseAuthGuard>
                            <SupervisorProvider>
                                <AdminGuard>
                                    <AdminRoutes />
                                </AdminGuard>
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
