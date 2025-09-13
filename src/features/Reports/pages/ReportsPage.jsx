import { useTranslation } from 'react-i18next'
import ContentFrame from '../../../components/ContentFrame'

import { HomeOutlined } from '@ant-design/icons'
import ReportsTable from '../components/ReportsTable'

const ReportsPage = () => {
    const { t } = useTranslation()

    return (
        <ContentFrame
            title={t('reports.title')}
            description={t('reports.description')}
            breadcrumbs={[
                {
                    title: <HomeOutlined />,
                },
                {
                    href: '/app/dashboard',
                    title: t('dashboard.title'),
                },
                {
                    href: '/app/dashboard/reports',
                    title: t('reports.title'),
                },
            ]}
        >
            <ReportsTable />
        </ContentFrame>
    )
}

export default ReportsPage
