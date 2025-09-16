import { useTranslation } from 'react-i18next'
import ContentFrame from '../../../components/ContentFrame'

import { HomeOutlined } from '@ant-design/icons'
import DeliveriesTable from '../components/DeliveriesTable'

const DeliveriesPage = () => {
    const { t } = useTranslation()

    return (
        <ContentFrame
            title={t('deliveries.title')}
            description={t('deliveries.description')}
            breadcrumbs={[
                {
                    title: <HomeOutlined />,
                },
                {
                    href: '/app/dashboard',
                    title: t('dashboard.title'),
                },
                {
                    href: '/app/dashboard/deliveries',
                    title: t('deliveries.title'),
                },
            ]}
        >
            <DeliveriesTable />
        </ContentFrame>
    )
}

export default DeliveriesPage
