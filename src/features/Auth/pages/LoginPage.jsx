import { Button, Layout } from 'antd'
import { Flex } from 'antd'

const { Header, Content, Footer } = Layout

import { useTranslation } from 'react-i18next'
const LoginPage = () => {
    const { t } = useTranslation('auth')
    return (
        <Layout>
            <Content style={{ display: 'flex', height: '100vh', width: '100vw' }}>
                <Flex
                    vertical
                    align="center"
                    justify="center"
                    gap={2}
                    style={{ width: '100%' }}
                >
                    <h1>{t('login.title')}</h1>
                    <Button type="primary">{t('login.button')}</Button>
                </Flex>
            </Content>
        </Layout>
    )
}

export default LoginPage
