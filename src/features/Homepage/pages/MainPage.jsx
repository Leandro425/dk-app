import { Layout, Image, Flex, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import Footer from '../components/Footer'
import Header from '../components/Header'

const { Text, Title } = Typography

const { Content } = Layout
const MainPage = () => {
    const { t } = useTranslation()
    return (
        <Flex
            vertical
            // justify="center"
            align="center"
            gap={32}
            style={{ width: '100%', paddingTop: 64 }}
        >
            <Image
                width={500}
                preview={false}
                src="src/assets/dk_logo_black.png"
            />
            <Flex
                vertical
                gap={0}
            >
                <Title level={4}>{t('homepage.welcome')}</Title>
                <Text>{t('homepage.description')}</Text>
            </Flex>
        </Flex>
    )
}

export default MainPage
