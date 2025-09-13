import { Form, message, Modal } from 'antd'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { useQueryClient } from '@tanstack/react-query'
import FormReportFields from './FormReportFields'

import { dateStringToDayjs, timeStringToDayjs } from '../../../../utils/helpers'
import dayjs from 'dayjs'
import useSupervisorContext from '../../../../context/user/supervisorContext'

const getFormValues = (report) => {
    return {
        employee: report?.employee_id,
        date: dateStringToDayjs(report?.date),
        field: report?.field_id,
        article: report?.article_id,
        quantity: report?.quantity,
        timeRange: [timeStringToDayjs(report?.start_time), timeStringToDayjs(report?.end_time)],
        break_time_min: report?.break_time_min,
        annotation: report?.annotation || '',
    }
}

const EditReportModal = ({ open, onClose, report }) => {
    const { t } = useTranslation()
    const { supervisor } = useSupervisorContext()
    const { supabase } = useSupabaseContext()
    const queryClient = useQueryClient()
    const [messageApi, contextHolder] = message.useMessage()
    const [confirmLoading, setConfirmLoading] = useState(false)
    const form = useForm({ mode: 'onChange', defaultValues: getFormValues(report) })

    const {
        control,
        handleSubmit,
        formState: { errors, isValid, isDirty },
        reset,
    } = form

    const onSubmit = async (data) => {
        setConfirmLoading(true)
        const { error } = await supabase
            .from('Report')
            .update([
                {
                    employee_id: data.employee,
                    date: data.date.format('YYYY-MM-DD'),
                    field_id: data.field,
                    article_id: data.article,
                    quantity: data.quantity,
                    start_time: data.timeRange && data.timeRange[0] ? data.timeRange[0].format('HH:mm') : null,
                    end_time: data.timeRange && data.timeRange[1] ? data.timeRange[1].format('HH:mm') : null,
                    break_time_min: data.break_time_min,
                    modified_by: supervisor.id,
                    modified_at: dayjs().toISOString(),
                    annotation: data.annotation,
                },
            ])
            .eq('id', report.id)
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

    useEffect(() => {
        if (report) {
            reset(getFormValues(report))
        }
    }, [report, reset])

    return (
        <FormProvider {...form}>
            {contextHolder}
            <Form layout="vertical">
                <Modal
                    title={t('reports.actions.edit')}
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

export default EditReportModal
