import { Typography, Row, Col, Card, Button, Flex } from 'antd'

import { useTranslation } from 'react-i18next'
import ContentFrame from '../../../components/ContentFrame'
import { HomeOutlined } from '@ant-design/icons'

import { useNavigate } from 'react-router-dom'
import Stats from '../components/Stats'

const DashboardPage = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    return (
        <ContentFrame
            title={t('dashboard.title')}
            description={t('dashboard.description')}
            breadcrumbs={[
                {
                    title: <HomeOutlined />,
                },
                {
                    href: '/app/dashboard',
                    title: t('dashboard.title'),
                },
            ]}
        >
            <Flex
                vertical
                gap={16}
            >
                <Stats />
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Card
                            title={t('dashboard.reports.title')}
                            extra={
                                <Button
                                    type="primary"
                                    onClick={() => navigate('/app/dashboard/reports')}
                                >
                                    {t('common.actions.open')}
                                </Button>
                            }
                        >
                            <Typography.Text>{t('dashboard.reports.content')}</Typography.Text>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card
                            title={t('dashboard.timestamps.title')}
                            extra={
                                <Button
                                    type="primary"
                                    onClick={() => navigate('/app/dashboard/timestamps')}
                                >
                                    {t('common.actions.open')}
                                </Button>
                            }
                        >
                            <Typography.Text>{t('dashboard.timestamps.content')}</Typography.Text>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card
                            title={t('dashboard.deliveries.title')}
                            extra={
                                <Button
                                    type="primary"
                                    onClick={() => navigate('/app/dashboard/deliveries')}
                                >
                                    {t('common.actions.open')}
                                </Button>
                            }
                        >
                            <Typography.Text>{t('dashboard.deliveries.content')}</Typography.Text>
                        </Card>
                    </Col>
                </Row>
            </Flex>
        </ContentFrame>
    )
}
export default DashboardPage
