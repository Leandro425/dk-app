import { Layout, Image, Flex } from 'antd'
import { useTranslation } from 'react-i18next'

const { Header, Content, Footer } = Layout
const MainPage = () => {
    const { t } = useTranslation()
    return (
        <Layout style={{ minHeight: '100vh', width: '100vw', textAlign: 'center' }}>
            <Header style={{ display: 'flex', alignItems: 'center' }}></Header>
            <Content>
                <Flex
                    justify="center"
                    align="center"
                    style={{ paddingTop: '100px' }}
                >
                    <Image
                        width={500}
                        preview={false}
                        src="src/assets/dk_logo_black.png"
                    />
                </Flex>
            </Content>
            <Footer>{t('homepage.footer')}</Footer>
        </Layout>
    )
}

export default MainPage
