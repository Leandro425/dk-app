import { useTranslation } from 'react-i18next'
import ContentFrame from '../../../components/ContentFrame'
import { useNavigate } from 'react-router-dom'
import { HomeOutlined } from '@ant-design/icons'
import ReportsTable from '../components/ReportsTable'

const ReportsPage = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    return (
        <ContentFrame
            title={t('reports.title')}
            description={t('reports.description')}
            breadcrumbs={[
                {
                    title: <HomeOutlined />,
                },
                {
                    path: '',
                    title: t('dashboard.title'),
                    onClick: () => {
                        navigate('/app/dashboard')
                    },
                },
                {
                    path: '',
                    title: t('reports.title'),
                    onClick: () => {
                        navigate('/app/dashboard/reports')
                    },
                },
            ]}
        >
            <ReportsTable />
        </ContentFrame>
    )
}

export default ReportsPage
