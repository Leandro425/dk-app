import { Form, message, Modal } from 'antd'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import FormReportFields from './FormReportFields'
import useSupervisorContext from '../../../../context/user/supervisorContext'

const formatDateString = 'YYYY-MM-DD'
const formatTimeString = 'HH:mm'

const getFormValues = () => {
    const today = dayjs()
    return {
        employee: null,
        date: dayjs(today.format(formatDateString), formatDateString),
        field: null,
        article: null,
        quantity: '',
        timeRange: [null, null],
        annotation: '',
    }
}

const AddReportModal = ({ open, onClose }) => {
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
        const startTime = data.timeRange && data.timeRange[0] ? data.timeRange[0].format(formatTimeString) : null
        const endTime = data.timeRange && data.timeRange[1] ? data.timeRange[1].format(formatTimeString) : null
        const { error } = await supabase.from('Report').insert([
            {
                employee_id: data.employee,
                date: dayjs().format('YYYY-MM-DD'),
                field_id: data.field,
                article_id: data.article,
                quantity: data.quantity,
                start_time: startTime,
                end_time: endTime,
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
        queryClient.invalidateQueries({ queryKey: ['reports'] })
    }

    return (
        <FormProvider {...form}>
            {contextHolder}
            <Form layout="vertical">
                <Modal
                    title={t('reports.actions.add')}
                    open={open}
                    onOk={handleSubmit(onSubmit)}
                    confirmLoading={confirmLoading}
                    onCancel={onClose}
                    okButtonProps={{ disabled: !isDirty || !isValid || confirmLoading }}
                >
                    <FormReportFields
                        control={control}
                        errors={errors}
                        enabledSelects={open}
                    />
                </Modal>
            </Form>
        </FormProvider>
    )
}

export default AddReportModal
