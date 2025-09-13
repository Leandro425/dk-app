import { Button, Flex, Layout, theme } from 'antd'
import { Divider } from 'antd'
import { useTranslation } from 'react-i18next'
import DarkModeToggle from '../../../../components/DarkModeToggle'
import SettingsIconButton from '../../../../components/SettingsButton'

const Header = () => {
    const { t } = useTranslation()

    const {
        token: { colorSplit },
    } = theme.useToken()
    return (
        <Layout.Header style={{ borderBottom: `1px solid ${colorSplit}` }}>
            <Flex
                justify="flex-end"
                align="center"
                style={{ height: '100%' }}
                gap={16}
            >
                <DarkModeToggle />
                <SettingsIconButton />
                <Button
                    type="default"
                    onClick={() => {
                        window.location.href = '/app/dashboard'
                    }}
                >
                    {t('common.actions.goToApplication')}
                </Button>
            </Flex>
        </Layout.Header>
    )
}

export default Header
