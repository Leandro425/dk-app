import { Form, message, Modal } from 'antd'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { useQueryClient } from '@tanstack/react-query'
import FormDeliveryItemFields from './FormDeliveryItemFields'

const getFormValues = (deliveryItem) => {
    return {
        field: deliveryItem?.field_id,
        article: deliveryItem?.article_id,
        order: deliveryItem?.order_id,
        quantity: deliveryItem?.quantity,
    }
}

const EditDeliveryItemModal = ({ open, onClose, deliveryId, deliveryItem }) => {
    const { t } = useTranslation()
    const { supabase } = useSupabaseContext()
    const queryClient = useQueryClient()
    const [messageApi, contextHolder] = message.useMessage()
    const [confirmLoading, setConfirmLoading] = useState(false)
    const form = useForm({ mode: 'onChange', defaultValues: getFormValues(deliveryItem) })

    const {
        control,
        handleSubmit,
        formState: { errors, isValid, isDirty },
        reset,
    } = form

    const onSubmit = async (data) => {
        setConfirmLoading(true)
        const { error } = await supabase
            .from('delivery_item')
            .update([
                {
                    field_id: data.field,
                    article_id: data.article,
                    order_id: data.order,
                    quantity: data.quantity,
                },
            ])
            .eq('id', deliveryItem.id)
        messageApi.open({
            type: error ? 'error' : 'success',
            content: error ? t('common.messages.errorOccurred') : t('common.messages.successfullyAdded'),
            duration: 3,
        })
        onClose()
        setConfirmLoading(false)
        reset()
        queryClient.invalidateQueries({ queryKey: ['deliveries', deliveryId, 'items'] })
    }

    useEffect(() => {
        if (deliveryItem) {
            reset(getFormValues(deliveryItem))
        }
    }, [deliveryItem, reset])

    return (
        <FormProvider {...form}>
            {contextHolder}
            <Form layout="vertical">
                <Modal
                    title={t('deliveries.items.actions.edit')}
                    open={open}
                    onOk={handleSubmit(onSubmit)}
                    confirmLoading={confirmLoading}
                    onCancel={onClose}
                    okButtonProps={{ disabled: !isDirty || !isValid || confirmLoading }}
                >
                    <FormDeliveryItemFields
                        control={control}
                        errors={errors}
                        enabledSelects={open}
                    />
                </Modal>
            </Form>
        </FormProvider>
    )
}

export default EditDeliveryItemModal
