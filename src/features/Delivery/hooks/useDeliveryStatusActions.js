import { useState } from 'react'
import { message } from 'antd'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import useSupabaseContext from '../../../context/supabase/supabaseContext'
import useSupervisorContext from '../../../context/user/supervisorContext'

export const isDeliveryCompleted = (delivery) => Boolean(delivery?.completed_at)

/**
 * Mark a delivery as done (goods delivered) or reopen it.
 * Done = `completed_at` set; open = `completed_at` NULL.
 */
const useDeliveryStatusActions = () => {
    const { t } = useTranslation()
    const { supabase } = useSupabaseContext()
    const { supervisor } = useSupervisorContext()
    const queryClient = useQueryClient()
    const [messageApi, contextHolder] = message.useMessage()
    const [loading, setLoading] = useState(false)

    const setCompleted = async (deliveryId, completed) => {
        setLoading(true)
        const { error } = await supabase
            .from('delivery')
            .update({
                completed_at: completed ? dayjs().toISOString() : null,
                modified_by_id: supervisor.id,
                modified_at: dayjs().toISOString(),
            })
            .eq('id', deliveryId)
        setLoading(false)

        messageApi.open({
            type: error ? 'error' : 'success',
            content: error ? t('common.messages.errorOccurred') : t('common.messages.successfullyUpdated'),
            duration: 3,
        })

        if (!error) {
            queryClient.invalidateQueries({ queryKey: ['deliveries'] })
        }
        return !error
    }

    return {
        completeDelivery: (deliveryId) => setCompleted(deliveryId, true),
        reopenDelivery: (deliveryId) => setCompleted(deliveryId, false),
        loading,
        contextHolder,
    }
}

export default useDeliveryStatusActions
