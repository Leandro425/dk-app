import { Button, Flex, Layout, theme } from 'antd'
import { useTranslation } from 'react-i18next'
import DarkModeToggle from '../../../../components/DarkModeToggle'
import { useNavigate } from 'react-router-dom'

const Header = () => {
    const { t } = useTranslation()
    const navigation = useNavigate()

    const {
        token: { colorSplit },
    } = theme.useToken()
    return (
        <Layout.Header
            fixed
            style={{ borderBottom: `1px solid ${colorSplit}` }}
        >
            <Flex
                justify="flex-end"
                align="center"
                style={{ height: '100%' }}
                gap={16}
            >
                <Flex gap={16}>
                    <Button
                        type="default"
                        onClick={() => {
                            navigation('/app/auth/login')
                        }}
                    >
                        {t('common.actions.goToSignIn')}
                    </Button>
                    <DarkModeToggle />
                </Flex>
            </Flex>
        </Layout.Header>
    )
}

export default Header
