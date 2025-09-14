import { useTranslation } from 'react-i18next'
import ContentFrame from '../../../components/ContentFrame'

import { HomeOutlined } from '@ant-design/icons'
import TimestampsTable from '../components/TimestampsTable'

const TimestampsPage = () => {
    const { t } = useTranslation()

    return (
        <ContentFrame
            title={t('timestamps.title')}
            description={t('timestamps.description')}
            breadcrumbs={[
                {
                    title: <HomeOutlined />,
                },
                {
                    href: '/app/dashboard',
                    title: t('dashboard.title'),
                },
                {
                    href: '/app/dashboard/timestamps',
                    title: t('timestamps.title'),
                },
            ]}
        >
            <TimestampsTable />
        </ContentFrame>
    )
}

export default TimestampsPage
