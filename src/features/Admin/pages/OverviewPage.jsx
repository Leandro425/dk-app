import { Card, Empty } from 'antd'
import { ControlOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import ContentFrame from '../../../components/ContentFrame'
import { ADMIN_BASE } from '../constants'

const OverviewPage = () => {
    const { t } = useTranslation()

    return (
        <ContentFrame
            title={t('admin.overview.title')}
            description={t('admin.overview.description')}
            breadcrumbs={[
                { href: ADMIN_BASE, title: <ControlOutlined /> },
                { href: ADMIN_BASE, title: t('admin.title') },
                { href: ADMIN_BASE, title: t('admin.overview.title') },
            ]}
        >
            <Card>
                <Empty description={t('common.messages.comingSoon')} />
            </Card>
        </ContentFrame>
    )
}

export default OverviewPage
