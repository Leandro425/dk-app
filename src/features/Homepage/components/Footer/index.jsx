import { Button, Divider, Flex, Layout, theme, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Logo from '../../../../components/Logo'

const Footer = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const {
        token: { colorSplit },
    } = theme.useToken()
    return (
        <Layout.Footer style={{ borderTop: `1px solid ${colorSplit}` }}>
            <Flex
                justify="center"
                align="center"
                gap={8}
            >
                <Logo width={200} />
                <Flex
                    vertical
                    align="start"
                    gap={0}
                >
                    <Typography.Text strong>DK Nowack GmbH & Co. KG</Typography.Text>
                    <Typography.Text>Tel: +49 (0)1514 0066607</Typography.Text>
                    <Typography.Text>Email: info@dk-nowack.de</Typography.Text>
                    <Typography.Text>Landwehr 121, 46325 Borken</Typography.Text>
                </Flex>
                <Divider
                    type="vertical"
                    style={{ height: '100px' }}
                />
                <Flex
                    vertical
                    align="start"
                    gap={0}
                >
                    <Button
                        type="link"
                        style={{ padding: 0 }}
                        onClick={() => {
                            navigate('/')
                        }}
                    >
                        {t('homepage.footer.links.startPage')}
                    </Button>
                    <Button
                        type="link"
                        to="/imprint"
                        style={{ padding: 0 }}
                        onClick={() => {
                            navigate('/imprint')
                        }}
                    >
                        {t('homepage.footer.links.imprint')}
                    </Button>
                </Flex>
            </Flex>
        </Layout.Footer>
    )
}

export default Footer
