import { Navigate, Route, Routes } from 'react-router'
import DashboardPage from '../pages/DashboardPage'
import ReportRoutes from '../../Reports/routes/ReportRoutes'
import TimestampRoutes from '../../Timestamps'
import DeliveryRoutes from '../../Delivery/routes/DeliveryRoutes'

import { Layout } from 'antd'

import AppHeader from '../../../components/AppHeader'

const { Content } = Layout

const DashboardRoutes = () => {
    return (
        <Layout style={{ minHeight: '100vh', width: '100vw' }}>
            <AppHeader />
            <Content style={{ display: 'flex', justifyContent: 'center' }}>
                <Routes>
                    <Route
                        path="/*"
                        element={
                            <Routes>
                                <Route
                                    index={true}
                                    element={<DashboardPage />}
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
                            </Routes>
                        }
                    />
                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/app/dashboard"
                                replace={true}
                            />
                        }
                    />
                </Routes>
            </Content>
        </Layout>
    )
}

export default DashboardRoutes
