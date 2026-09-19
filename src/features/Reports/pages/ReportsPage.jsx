import { useTranslation } from 'react-i18next'
import ContentFrame from '../../../components/ContentFrame'

import ReportsTable from '../components/ReportsTable'

const ReportsPage = () => {
    const { t } = useTranslation()

    return (
        <ContentFrame
            title={t('reports.title')}
            description={t('reports.description')}
        >
            <ReportsTable />
        </ContentFrame>
    )
}

export default ReportsPage
