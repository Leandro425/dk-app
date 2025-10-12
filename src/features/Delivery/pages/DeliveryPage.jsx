import { useTranslation } from 'react-i18next'
import ContentFrame from '../../../components/ContentFrame'
import { Divider } from 'antd'
import { HomeOutlined } from '@ant-design/icons'

import { useParams } from 'react-router-dom'
import useSupabaseContext from '../../../context/supabase/supabaseContext'
import { useQuery } from '@tanstack/react-query'
import DeliveryInfoFrame from '../components/DeliveryInfoFrame'
import DeliveryItemsTable from '../components/DeliveryItemsTable'

const DeliveryPage = () => {
    const { t } = useTranslation()
    const { supabase } = useSupabaseContext()
    const { deliveryId } = useParams()

    const fetchData = async ({ queryKey }) => {
        const { data, error } = await supabase
            .from('delivery')
            .select(
                '*, customer:customer(*), created_by:supervisor!delivery_created_by_id_fkey(*), modified_by:supervisor!delivery_modified_by_id_fkey(*)'
            )
            .eq('id', queryKey[1])
            .single()
        if (error) {
            return null
        }
        return data
    }

    const { data } = useQuery({
        queryKey: ['deliveries', deliveryId],
        queryFn: fetchData,
    })

    return (
        <ContentFrame
            title={t('deliveries.delivery.title')}
            description={t('deliveries.delivery.description')}
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
                {
                    href: `/app/dashboard/deliveries/${deliveryId}`,
                    title: t('deliveries.delivery.title'),
                },
            ]}
        >
            <Divider />
            <DeliveryInfoFrame delivery={data} />
            <Divider />
            <DeliveryItemsTable deliveryId={deliveryId} />
        </ContentFrame>
    )
}

export default DeliveryPage
