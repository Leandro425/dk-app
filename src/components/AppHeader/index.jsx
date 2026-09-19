import { Divider, Flex, Layout, theme, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import LogoText from '../LogoText'
import DarkModeToggle from '../DarkModeToggle'
import AreaSwitcher from './AreaSwitcher'
import UserMenu from './UserMenu'
import useAreaNav from '../../hooks/useAreaNav'
import useSupervisorContext from '../../context/user/supervisorContext'

const { Header } = Layout
const { Title } = Typography

/**
 * Global header for all logged-in pages. Left: logo (goes to the current area's overview)
 * and the area switcher for admins, or the area title for everyone else. Right: dark mode and user menu.
 */
const AppHeader = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { area } = useAreaNav()
    const { supervisor } = useSupervisorContext()
    const {
        token: { colorBorder },
    } = theme.useToken()

    return (
        <Header style={{ borderBottom: `1px solid ${colorBorder}` }}>
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
                        onClick={() => navigate(area.base)}
                    />
                    <Divider
                        type="vertical"
                        style={{ height: 32, margin: 0 }}
                    />
                    {supervisor?.is_admin ? (
                        <AreaSwitcher />
                    ) : (
                        <Title
                            level={4}
                            style={{ margin: 0 }}
                        >
                            {t(area.titleKey)}
                        </Title>
                    )}
                </Flex>
                <Flex
                    gap={8}
                    align="center"
                >
                    <DarkModeToggle />
                    <UserMenu />
                </Flex>
            </Flex>
        </Header>
    )
}

export default AppHeader
