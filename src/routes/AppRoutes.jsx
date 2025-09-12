import { Route, Routes } from 'react-router-dom'
import SupabaseProvider from '../context/supabase/SupabaseProvider'
import { AuthRoutes } from '../features/Auth'
import DashboardRoutes from '../features/Dashboard/routes/DashboardRoute'
import SupabaseAuthGuard from '../components/guards/SupabaseAuthGuard'

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
                            <DashboardRoutes />
                        </SupabaseAuthGuard>
                    }
                />
                <Route
                    path="*"
                    element={<h1>Not Found</h1>}
                />
            </Routes>
        </SupabaseProvider>
    )
}

export default AppRoutes
