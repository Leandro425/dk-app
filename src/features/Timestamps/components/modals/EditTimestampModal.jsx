import { Form, message, Modal } from 'antd'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { useQueryClient } from '@tanstack/react-query'
import FormTimestampFields from './FormTimestampFields'

import { dateStringToDayjs, timeStringToDayjs } from '../../../../utils/helpers'
import dayjs from 'dayjs'
import useSupervisorContext from '../../../../context/user/supervisorContext'

const getFormValues = (timestamp) => {
    return {
        employee: timestamp?.employee_id,
        date: dateStringToDayjs(timestamp?.date),
        field: timestamp?.field_id,
        article: timestamp?.article_id,
        quantity: timestamp?.quantity,
        timeRange: [timeStringToDayjs(timestamp?.start_time), timeStringToDayjs(timestamp?.end_time)],
        break_in_min: timestamp?.break_in_min || '',
        annotation: timestamp?.annotation || '',
    }
}

const EditTimestampModal = ({ open, onClose, timestamp }) => {
    const { t } = useTranslation()
    const { supervisor } = useSupervisorContext()
    const { supabase } = useSupabaseContext()
    const queryClient = useQueryClient()
    const [messageApi, contextHolder] = message.useMessage()
    const [confirmLoading, setConfirmLoading] = useState(false)
    const form = useForm({ mode: 'onChange', defaultValues: getFormValues(timestamp) })

    const {
        control,
        handleSubmit,
        formState: { errors, isValid, isDirty },
        reset,
    } = form

    const onSubmit = async (data) => {
        setConfirmLoading(true)
        const { error } = await supabase
            .from('timestamp')
            .update([
                {
                    employee_id: data.employee,
                    date: data.date.format('YYYY-MM-DD'),
                    start_time: data.timeRange && data.timeRange[0] ? data.timeRange[0].format('HH:mm') : null,
                    end_time: data.timeRange && data.timeRange[1] ? data.timeRange[1].format('HH:mm') : null,
                    break_in_min: data.break_in_min ? parseFloat(data.break_in_min) : null,
                    modified_by_id: supervisor.id,
                    modified_at: dayjs().toISOString(),
                    annotation: data.annotation,
                },
            ])
            .eq('id', timestamp.id)
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

    useEffect(() => {
        if (timestamp) {
            reset(getFormValues(timestamp))
        }
    }, [timestamp, reset])

    return (
        <FormProvider {...form}>
            {contextHolder}
            <Form layout="vertical">
                <Modal
                    title={t('timestamps.actions.edit')}
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

export default EditTimestampModal
