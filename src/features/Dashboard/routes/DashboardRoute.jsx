import { Navigate, Route, Routes } from 'react-router'
import DashboardPage from '../pages/DashboardPage'
import ReportsRoutes from '../../Reports/routes/ReportRoutes'
import { Flex, Layout, Typography } from 'antd'

import LogoutButton from '../../../components/LogoutButton'

import SettingsIconButton from '../../../components/SettingsButton'
import DarkModeToggle from '../../../components/DarkModeToggle'

import useSupervisorContext from '../../../context/user/supervisorContext'
import { useTranslation } from 'react-i18next'

import LogoText from '../../../components/LogoText'
import Icon from '../../../components/Icon'
const { Header, Content, Footer } = Layout
const { Paragraph, Title } = Typography

const DashboardRoutes = () => {
    const { t } = useTranslation()
    const { supervisor } = useSupervisorContext()
    return (
        <Layout style={{ minHeight: '100vh', width: '100vw' }}>
            <Header>
                <Flex
                    mode="horizontal"
                    gap={16}
                    align="center"
                    justify="space-between"
                    style={{ height: '100%' }}
                >
                    <Flex align="center">
                        {/* <Icon width={80} /> */}
                        <LogoText width={220} />
                    </Flex>
                    <Flex
                        gap={16}
                        align="center"
                    >
                        <Title
                            level={5}
                            style={{ margin: 0 }}
                        >
                            {supervisor ? `${t('common.greetings.hello')}, ${supervisor.name}` : 'Dashboard'}
                        </Title>
                        <LogoutButton />
                        <DarkModeToggle />
                        <SettingsIconButton />
                    </Flex>
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
