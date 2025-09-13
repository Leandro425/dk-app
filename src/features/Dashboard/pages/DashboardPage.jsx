import { Flex, Typography, Row, Col, Card, Button, Tag } from 'antd'

import { useTranslation } from 'react-i18next'
import ContentFrame from '../../../components/ContentFrame'
import { HomeOutlined } from '@ant-design/icons'

import { useNavigate } from 'react-router-dom'

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
                    onClick: () => {
                        navigate('/app/dashboard')
                    },
                },
            ]}
        >
            <Flex
                flex={1}
                vertical
                gap="16px"
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Card
                            title={t('dashboard.reports.title')}
                            extra={
                                <Button
                                    type="default"
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
                            title={t('dashboard.deliveryNotes.title')}
                            extra={
                                <>
                                    <Tag color="blue">{t('common.messages.comingSoon')}</Tag>
                                    {/* <Button
                                        type="primary"
                                        onClick={() => navigate('/app/dashboard/delivery-notes')}
                                        disabled
                                    >
                                        {t('common.actions.open')}
                                    </Button> */}
                                </>
                            }
                        >
                            <Typography.Text>{t('dashboard.deliveryNotes.content')}</Typography.Text>
                        </Card>
                    </Col>
                </Row>
            </Flex>
        </ContentFrame>
    )
}
export default DashboardPage
