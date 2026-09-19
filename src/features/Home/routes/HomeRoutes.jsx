import { Navigate, Route, Routes } from 'react-router'

import AppShell from '../../../components/AppShell'
import DashboardRoutes from '../../Dashboard'
import ReportRoutes from '../../Reports/routes/ReportRoutes'
import TimestampRoutes from '../../Timestamps'
import DeliveryRoutes from '../../Delivery/routes/DeliveryRoutes'
import { HOME_BASE } from '../constants'

const DASHBOARD_PATH = `${HOME_BASE}/dashboard`

/**
 * Home area: the shared shell plus one route per module.
 * The area has no page of its own; its index opens the dashboard module.
 */
const HomeRoutes = () => {
    return (
        <AppShell>
            <Routes>
                <Route
                    index={true}
                    element={
                        <Navigate
                            to={DASHBOARD_PATH}
                            replace={true}
                        />
                    }
                />
                <Route
                    path="dashboard/*"
                    element={<DashboardRoutes />}
                />
                <Route
                    path="reports/*"
                    element={<ReportRoutes />}
                />
                <Route
                    path="timestamps/*"
                    element={<TimestampRoutes />}
                />
                <Route
                    path="deliveries/*"
                    element={<DeliveryRoutes />}
                />
                <Route
                    path="*"
                    element={
                        <Navigate
                            to={DASHBOARD_PATH}
                            replace={true}
                        />
                    }
                />
            </Routes>
        </AppShell>
    )
}

export default HomeRoutes
