import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import { DashboardOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

import AppHeader from '../../../components/AppHeader'
import OverviewPage from '../pages/OverviewPage'
import { ADMIN_BASE } from '../constants'

const { Content, Sider } = Layout

const AdminRoutes = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { pathname } = useLocation()

    // Add further modules here as they are built.
    const menuItems = [{ key: ADMIN_BASE, icon: <DashboardOutlined />, label: t('admin.menu.overview') }]

    const selectedKey = menuItems
        .map((item) => item.key)
        .filter((key) => pathname === key || pathname.startsWith(`${key}/`))
        .sort((a, b) => b.length - a.length)[0]

    return (
        <Layout style={{ minHeight: '100vh', width: '100vw' }}>
            <AppHeader title={t('admin.title')} />
            <Layout>
                <Sider
                    width={240}
                    breakpoint="lg"
                    collapsedWidth={64}
                >
                    <Menu
                        mode="inline"
                        selectedKeys={selectedKey ? [selectedKey] : []}
                        items={menuItems}
                        onClick={({ key }) => navigate(key)}
                        style={{ height: '100%', borderInlineEnd: 0 }}
                    />
                </Sider>
                <Content style={{ display: 'flex', justifyContent: 'center' }}>
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
                </Content>
            </Layout>
        </Layout>
    )
}

export default AdminRoutes
