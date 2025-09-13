import { Button, Flex, Layout, List, theme, Timeline, Typography } from 'antd'
import { Divider } from 'antd'
import { useTranslation } from 'react-i18next'
import Logo from '../../../../components/Logo'

const Footer = () => {
    const { t } = useTranslation()

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
                        href="/Homepage"
                        style={{ padding: 0 }}
                    >
                        {t('homepage.footer.links.homepage')}
                    </Button>
                    <Button
                        type="link"
                        href="/imprint"
                        style={{ padding: 0 }}
                    >
                        {t('homepage.footer.links.imprint')}
                    </Button>
                    <Button
                        type="link"
                        href="/contact"
                        style={{ padding: 0 }}
                    >
                        {t('homepage.footer.links.contact')}
                    </Button>
                </Flex>
            </Flex>
        </Layout.Footer>
    )
}

export default Footer
