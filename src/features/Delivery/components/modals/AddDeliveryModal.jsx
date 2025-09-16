import { Form, message, Modal } from 'antd'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import FormDeliveryFields from './FormDeliveryFields'
import useSupervisorContext from '../../../../context/user/supervisorContext'

const getFormValues = () => {
    return {
        date: dayjs(),
        field: null,
        article: null,
        order: null,
        quantity: '',
        annotation: '',
    }
}

const AddDeliveryModal = ({ open, onClose }) => {
    const { t } = useTranslation()
    const { supervisor } = useSupervisorContext()
    const { supabase } = useSupabaseContext()
    const queryClient = useQueryClient()
    const [messageApi, contextHolder] = message.useMessage()
    const [confirmLoading, setConfirmLoading] = useState(false)
    const form = useForm({ mode: 'onChange', defaultValues: getFormValues() })

    const {
        control,
        handleSubmit,
        formState: { errors, isValid, isDirty },
        reset,
    } = form

    const onSubmit = async (data) => {
        setConfirmLoading(true)
        const { error } = await supabase.from('Delivery').insert([
            {
                date: dayjs().format('YYYY-MM-DD'),
                field_id: data.field,
                article_id: data.article,
                order_id: data.order,
                quantity: data.quantity,
                created_by: supervisor.id,
                annotation: data.annotation,
            },
        ])
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

    return (
        <FormProvider {...form}>
            {contextHolder}
            <Form layout="vertical">
                <Modal
                    title={t('deliveries.actions.add')}
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

export default AddDeliveryModal
