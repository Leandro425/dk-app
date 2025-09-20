import { Form, message, Modal } from 'antd'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import FormTimestampFields from './FormTimestampFields'
import useSupervisorContext from '../../../../context/user/supervisorContext'

const formatTimeString = 'HH:mm'

const getFormValues = () => {
    return {
        employee: null,
        date: dayjs(),
        timeRange: [null, null],
        break_in_min: '',
        annotation: '',
    }
}

const AddTimestampModal = ({ open, onClose }) => {
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
        const { error } = await supabase.from('timestamp').insert([
            {
                date: data.date.format('YYYY-MM-DD'),
                employee_id: data.employee,
                start_time: startTime,
                end_time: endTime,
                break_in_min: data.break_in_min ? parseFloat(data.break_in_min) : null,
                created_by_id: supervisor.id,
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
        queryClient.invalidateQueries({ queryKey: ['timestamps'] })
    }

    return (
        <FormProvider {...form}>
            {contextHolder}
            <Form layout="vertical">
                <Modal
                    title={t('timestamps.actions.add')}
                    open={open}
                    onOk={handleSubmit(onSubmit)}
                    confirmLoading={confirmLoading}
                    onCancel={onClose}
                    okButtonProps={{ disabled: !isDirty || !isValid || confirmLoading }}
                >
                    <FormTimestampFields
                        control={control}
                        errors={errors}
                        enabledSelects={open}
                    />
                </Modal>
            </Form>
        </FormProvider>
    )
}

export default AddTimestampModal
