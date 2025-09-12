import { Navigate, Route, Routes } from 'react-router'
import DashboardPage from '../pages/DashboardPage'
import ReportsRoutes from '../../Reports/routes/ReportRoutes'
import { Flex, Layout, Typography } from 'antd'

import LogoutButton from '../../../components/LogoutButton'

import SettingsIconButton from '../../../components/SettingsButton'
import DarkModeToggle from '../../../components/DarkModeToggle'
const { Header, Content, Footer } = Layout
const { Paragraph, Title } = Typography

const DashboardRoutes = () => {
    return (
        <Layout style={{ minHeight: '100vh', width: '100vw' }}>
            <Header>
                <Flex
                    mode="horizontal"
                    gap="16px"
                    align="center"
                    justify="end"
                    style={{ height: '100%' }}
                >
                    <DarkModeToggle />
                    <SettingsIconButton />
                    <LogoutButton />
                </Flex>
            </Header>
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
                                    element={<ReportsRoutes />}
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
