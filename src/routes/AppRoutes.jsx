import { Route, Routes } from 'react-router-dom'
import SupabaseProvider from '../context/supabase/SupabaseProvider'
import { AuthRoutes } from '../features/Auth'

const AppRoutes = () => {
    console.log('Rendering AppRoutes')
    return (
        <SupabaseProvider>
            <Routes>
                <Route
                    path="/auth/*"
                    element={<AuthRoutes />}
                />
                {/* <Route
                    path="/dashboard/*"
                    element={<DashboardRoutes />}
                /> */}
                <Route
                    path="*"
                    element={<h1>Not Found</h1>}
                />
            </Routes>
        </SupabaseProvider>
    )
}

export default AppRoutes
