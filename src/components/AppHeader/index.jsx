import { Button, Flex, Layout, Tooltip, Typography } from 'antd'
import { ControlOutlined, DashboardOutlined } from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import LogoText from '../LogoText'
import LogoutButton from '../LogoutButton'
import DarkModeToggle from '../DarkModeToggle'
import SettingsIconButton from '../SettingsButton'
import useSupervisorContext from '../../context/user/supervisorContext'
import { ADMIN_BASE } from '../../features/Admin/constants'

const { Header } = Layout
const { Title } = Typography

const DASHBOARD_PATH = '/app/dashboard'

/**
 * Admin-only toggle between the dashboard and the controlling area.
 * Shows the controlling icon on dashboard pages and the dashboard icon inside the area.
 */
const AdminAreaToggle = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const { supervisor } = useSupervisorContext()

    if (!supervisor?.is_admin) return null

    const insideAdmin = pathname === ADMIN_BASE || pathname.startsWith(`${ADMIN_BASE}/`)
    const title = insideAdmin ? t('admin.nav.backToDashboard') : t('admin.nav.openControlling')

    return (
        <Tooltip title={title}>
            <Button
                type="default"
                aria-label={title}
                icon={insideAdmin ? <DashboardOutlined /> : <ControlOutlined />}
                onClick={() => navigate(insideAdmin ? DASHBOARD_PATH : ADMIN_BASE)}
            />
        </Tooltip>
    )
}

/**
 * Global header for all logged-in pages. `title` names the current area (e.g. "Controlling").
 */
const AppHeader = ({ title }) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { supervisor } = useSupervisorContext()

    return (
        <Header>
            <Flex
                gap={16}
                align="center"
                justify="space-between"
                style={{ height: '100%' }}
            >
                <Flex
                    align="center"
                    gap={16}
                >
                    <LogoText
                        width={220}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(DASHBOARD_PATH)}
                    />
                    {title && (
                        <Title
                            level={4}
                            style={{ margin: 0 }}
                        >
                            {title}
                        </Title>
                    )}
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
                    <AdminAreaToggle />
                    <SettingsIconButton />
                </Flex>
            </Flex>
        </Header>
    )
}

export default AppHeader
