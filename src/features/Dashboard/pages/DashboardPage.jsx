import { useTranslation } from 'react-i18next'

import ContentFrame from '../../../components/ContentFrame'
import Stats from '../components/Stats'
import useSupervisorContext from '../../../context/user/supervisorContext'

const DashboardPage = () => {
    const { t } = useTranslation()
    const { supervisor } = useSupervisorContext()

    return (
        <ContentFrame
            title={t('dashboard.title')}
            description={t('dashboard.description')}
        >
            {supervisor?.is_admin && <Stats />}
        </ContentFrame>
    )
}

export default DashboardPage
