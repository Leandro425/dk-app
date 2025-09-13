import { useNavigate } from 'react-router-dom'

import { Result, Button, Layout, Card } from 'antd'
import { useTranslation } from 'react-i18next'
const NotFoundPage = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    return (
        <Layout>
            <Layout.Content
                style={{
                    display: 'flex',
                    height: '100vh',
                    width: '100vw',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Card elevation={0}>
                    <Result
                        status="404"
                        title="404"
                        subTitle={t('common.messages.notFoundPage')}
                        extra={
                            <Button
                                type="primary"
                                onClick={() => navigate('/')}
                            >
                                {t('common.actions.goToHomepage')}
                            </Button>
                        }
                    />
                </Card>
            </Layout.Content>
        </Layout>
    )
}

export default NotFoundPage
