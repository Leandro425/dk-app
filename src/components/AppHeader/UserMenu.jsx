import { Fragment, useState } from 'react'
import { Avatar, Button, Dropdown, Space, Typography } from 'antd'
import { DownOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import useSupabaseContext from '../../context/supabase/supabaseContext'
import useSupervisorContext from '../../context/user/supervisorContext'
import SettingsDialog from '../dialogs/SettiingsDialog'

const { Text } = Typography

const initialsOf = (name = '') =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('')

/**
 * Avatar dropdown with settings and sign-out. Replaces the separate settings and
 * logout buttons so sign-out is no longer a single accidental click away.
 */
const UserMenu = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { logout } = useSupabaseContext()
    const { supervisor } = useSupervisorContext()
    const [settingsOpen, setSettingsOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/app/auth/login')
    }

    const items = [
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: t('settings.title'),
            onClick: () => setSettingsOpen(true),
        },
        { type: 'divider' },
        { key: 'logout', icon: <LogoutOutlined />, label: t('common.actions.signOut'), onClick: handleLogout },
    ]

    return (
        <Fragment>
            <Dropdown
                menu={{ items }}
                trigger={['click']}
                placement="bottomRight"
            >
                <Button type="text">
                    <Space>
                        <Avatar size="small">{initialsOf(supervisor?.name)}</Avatar>
                        {supervisor?.name && <Text>{supervisor.name}</Text>}
                        <DownOutlined style={{ fontSize: 10 }} />
                    </Space>
                </Button>
            </Dropdown>
            <SettingsDialog
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
            />
        </Fragment>
    )
}

export default UserMenu
