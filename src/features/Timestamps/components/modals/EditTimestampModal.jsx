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

const getFormValues = (Timestamp) => {
    return {
        employee: Timestamp?.employee_id,
        date: dateStringToDayjs(Timestamp?.date),
        field: Timestamp?.field_id,
        article: Timestamp?.article_id,
        quantity: Timestamp?.quantity,
        timeRange: [timeStringToDayjs(Timestamp?.start_time), timeStringToDayjs(Timestamp?.end_time)],
        break_in_min: Timestamp?.break_in_min || '',
        annotation: Timestamp?.annotation || '',
    }
}

const EditTimestampModal = ({ open, onClose, Timestamp }) => {
    const { t } = useTranslation()
    const { supervisor } = useSupervisorContext()
    const { supabase } = useSupabaseContext()
    const queryClient = useQueryClient()
    const [messageApi, contextHolder] = message.useMessage()
    const [confirmLoading, setConfirmLoading] = useState(false)
    const form = useForm({ mode: 'onChange', defaultValues: getFormValues(Timestamp) })

    const {
        control,
        handleSubmit,
        formState: { errors, isValid, isDirty },
        reset,
    } = form

    const onSubmit = async (data) => {
        setConfirmLoading(true)
        const { error } = await supabase
            .from('Timestamp')
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
            .eq('id', Timestamp.id)
        messageApi.open({
            type: error ? 'error' : 'success',
            content: error ? t('common.messages.errorOccurred') : t('common.messages.successfullyAdded'),
            duration: 3,
        })
        onClose()
        setConfirmLoading(false)
        reset()
        queryClient.invalidateQueries({ queryKey: ['Timestamps'] })
    }

    useEffect(() => {
        if (Timestamp) {
            reset(getFormValues(Timestamp))
        }
    }, [Timestamp, reset])

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
