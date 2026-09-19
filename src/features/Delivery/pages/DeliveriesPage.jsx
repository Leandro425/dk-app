import { useTranslation } from 'react-i18next'
import ContentFrame from '../../../components/ContentFrame'

import DeliveriesTable from '../components/DeliveriesTable'

const DeliveriesPage = () => {
    const { t } = useTranslation()

    return (
        <ContentFrame
            title={t('deliveries.title')}
            description={t('deliveries.description')}
        >
            <DeliveriesTable />
        </ContentFrame>
    )
}

export default DeliveriesPage
