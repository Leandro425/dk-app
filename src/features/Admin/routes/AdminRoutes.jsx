import { Suspense, lazy } from 'react'
import { Spin } from 'antd'
import { Navigate, Route, Routes } from 'react-router-dom'

import AppShell from '../../../components/AppShell'
import OverviewPage from '../pages/OverviewPage'

// Loaded on demand: pulls in the PDF renderer and the Excel/ZIP libraries.
const PayrollPage = lazy(() => import('../pages/PayrollPage'))

const pageFallback = (
    <Spin
        size="large"
        style={{ display: 'block', margin: '96px auto' }}
    />
)
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
                    path="payroll"
                    element={
                        <Suspense fallback={pageFallback}>
                            <PayrollPage />
                        </Suspense>
                    }
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
