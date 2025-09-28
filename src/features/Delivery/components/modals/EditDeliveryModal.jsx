import { Form, message, Modal } from 'antd'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { useQueryClient } from '@tanstack/react-query'
import FormDeliveryFields from './FormDeliveryFields'

import { dateStringToDayjs } from '../../../../utils/helpers'
import dayjs from 'dayjs'
import useSupervisorContext from '../../../../context/user/supervisorContext'

const getFormValues = (delivery) => {
    return {
        date: dateStringToDayjs(delivery?.date),
        field: delivery?.field_id,
        article: delivery?.article_id,
        order: delivery?.order_id,
        quantity: delivery?.quantity,
        annotation: delivery?.annotation || '',
    }
}

const EditDeliveryModal = ({ open, onClose, delivery }) => {
    const { t } = useTranslation()
    const { supervisor } = useSupervisorContext()
    const { supabase } = useSupabaseContext()
    const queryClient = useQueryClient()
    const [messageApi, contextHolder] = message.useMessage()
    const [confirmLoading, setConfirmLoading] = useState(false)
    const form = useForm({ mode: 'onChange', defaultValues: getFormValues(delivery) })

    const {
        control,
        handleSubmit,
        formState: { errors, isValid, isDirty },
        reset,
    } = form

    const onSubmit = async (data) => {
        setConfirmLoading(true)
        const { error } = await supabase
            .from('delivery_position')
            .update([
                {
                    date: data.date.format('YYYY-MM-DD'),
                    field_id: data.field,
                    article_id: data.article,
                    order_id: data.order,
                    quantity: data.quantity,
                    modified_by_id: supervisor.id,
                    modified_at: dayjs().toISOString(),
                    annotation: data.annotation,
                },
            ])
            .eq('id', delivery.id)
        messageApi.open({
            type: error ? 'error' : 'success',
            content: error ? t('common.messages.errorOccurred') : t('common.messages.successfullyAdded'),
            duration: 3,
        })
        onClose()
        setConfirmLoading(false)
        reset()
        queryClient.invalidateQueries({ queryKey: ['deliveries'] })
    }

    useEffect(() => {
        if (delivery) {
            reset(getFormValues(delivery))
        }
    }, [delivery, reset])

    return (
        <FormProvider {...form}>
            {contextHolder}
            <Form layout="vertical">
                <Modal
                    title={t('deliveries.actions.edit')}
                    open={open}
                    onOk={handleSubmit(onSubmit)}
                    confirmLoading={confirmLoading}
                    onCancel={onClose}
                    okButtonProps={{ disabled: !isDirty || !isValid || confirmLoading }}
                >
                    <FormDeliveryFields
                        control={control}
                        errors={errors}
                        enabledSelects={open}
                    />
                </Modal>
            </Form>
        </FormProvider>
    )
}

export default EditDeliveryModal
