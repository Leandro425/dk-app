import { useState } from 'react'
import { Button, Flex, Grid, Layout, Menu, theme } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import useAreaNav from '../../hooks/useAreaNav'
import useLocalStorage from '../../hooks/useLocalStorage'

const { Sider } = Layout

export const SIDER_WIDTH = 240
export const SIDER_COLLAPSED_WIDTH = 64
const TRIGGER_HEIGHT = 48

// One key for both areas: someone who prefers the icon rail gets it everywhere.
const COLLAPSED_STORAGE_KEY = 'areaSider.collapsed'

/**
 * In-flow replacement for antd's fixed-position Sider trigger, so the sidebar border
 * runs the full height and the trigger gets a separating line of its own.
 */
const CollapseTrigger = ({ collapsed, onToggle, borderColor }) => {
    const { t } = useTranslation()
    const label = collapsed ? t('common.actions.expandNavigation') : t('common.actions.collapseNavigation')

    return (
        <Button
            type="text"
            block
            aria-label={label}
            title={label}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onToggle}
            style={{ height: TRIGGER_HEIGHT, borderRadius: 0, borderTop: `1px solid ${borderColor}` }}
        />
    )
}

/**
 * Module sidebar shared by all logged-in areas. Items come from the navigation config
 * via `useAreaNav`, so the component itself does not know which area it is in.
 *
 * Collapses to an icon rail below `lg`, and to zero width (with antd's edge trigger) below `md`.
 * Only clicks on the trigger are remembered as the user's preference; responsive collapses are not.
 */
const AreaSider = () => {
    const navigate = useNavigate()
    const screens = Grid.useBreakpoint()
    const { items, selectedKey } = useAreaNav()
    const {
        token: { colorBorder },
    } = theme.useToken()

    const [collapsedPreference, setCollapsedPreference] = useLocalStorage(COLLAPSED_STORAGE_KEY, false)
    const [collapsed, setCollapsed] = useState(collapsedPreference)

    const handleCollapse = (value, type) => {
        setCollapsed(value)
        if (type === 'clickTrigger') setCollapsedPreference(value)
    }

    const menuItems = items.map((item) => ({
        key: item.path,
        icon: <item.icon />,
        label: item.label,
        disabled: Boolean(item.planned),
    }))

    // `screens.md` is undefined on the first render; treat that as a wide screen.
    // On phones the sidebar collapses to zero width and antd's edge trigger is the only way to open it.
    const isPhone = screens.md === false

    return (
        <Sider
            theme="light"
            width={SIDER_WIDTH}
            breakpoint="lg"
            collapsible
            collapsed={collapsed}
            collapsedWidth={isPhone ? 0 : SIDER_COLLAPSED_WIDTH}
            onCollapse={handleCollapse}
            trigger={isPhone ? undefined : null}
            style={{ borderInlineEnd: `1px solid ${colorBorder}` }}
        >
            <Flex
                vertical
                style={{ height: '100%' }}
            >
                <Menu
                    mode="inline"
                    selectedKeys={selectedKey ? [selectedKey] : []}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    style={{ flex: 1, borderInlineEnd: 0, paddingTop: 8 }}
                />
                {!isPhone && (
                    <CollapseTrigger
                        collapsed={collapsed}
                        onToggle={() => handleCollapse(!collapsed, 'clickTrigger')}
                        borderColor={colorBorder}
                    />
                )}
            </Flex>
        </Sider>
    )
}

export default AreaSider
