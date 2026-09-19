import { Card, Empty } from 'antd'
import { useTranslation } from 'react-i18next'
import ContentFrame from '../../../components/ContentFrame'

const OverviewPage = () => {
    const { t } = useTranslation()

    return (
        <ContentFrame
            title={t('admin.overview.title')}
            description={t('admin.overview.description')}
        >
            <Card>
                <Empty description={t('common.messages.comingSoon')} />
            </Card>
        </ContentFrame>
    )
}

export default OverviewPage
