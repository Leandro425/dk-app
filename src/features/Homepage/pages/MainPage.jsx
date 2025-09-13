import { Layout, Image, Flex, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import BackGroundImage1 from '../../../../src/assets/entry-cgi2.jpg'
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
            style={{
                width: '100%',
                paddingTop: 64,
                backgroundImage: `url(${BackGroundImage1})`,
                backgroundSize: 'cover',
                // minHeight: '100vh',
            }}
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
                <Title
                    level={4}
                    style={{ color: 'white' }}
                >
                    {t('homepage.welcome')}
                </Title>
                <Text style={{ color: 'white' }}>{t('homepage.description')}</Text>
            </Flex>
        </Flex>
    )
}

export default MainPage
