import { Navigate, Route, Routes } from 'react-router-dom'

import AppShell from '../../../components/AppShell'
import OverviewPage from '../pages/OverviewPage'
import { ADMIN_BASE } from '../constants'

const AdminRoutes = () => {
    return (
        <AppShell>
            <Routes>
                <Route
                    index={true}
                    element={<OverviewPage />}
                />
                <Route
                    path="*"
                    element={
                        <Navigate
                            to={ADMIN_BASE}
                            replace={true}
                        />
                    }
                />
            </Routes>
        </AppShell>
    )
}

export default AdminRoutes
