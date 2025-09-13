import { Form, message, Modal } from 'antd'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { useQueryClient } from '@tanstack/react-query'
import FormReportFields from './FormReportFields'
import dayjs from 'dayjs'

const getFormValues = (report) => {
    return {
        employee: report?.employee_id,
        date: report?.date,
        field: report?.field_id,
        article: report?.article_id,
        quantity: report?.quantity,
        timeRange:
            report?.start_time &&
            report?.end_time &&
            dayjs(report.start_time).isValid() &&
            dayjs(report.end_time).isValid()
                ? [dayjs(report.start_time), dayjs(report.end_time)]
                : [null, null],
        annotation: report?.annotation || '',
    }
}

const EditReportModal = ({ open, onClose, report }) => {
    const { t } = useTranslation()
    const { supabase } = useSupabaseContext()
    const queryClient = useQueryClient()
    const [messageApi, contextHolder] = message.useMessage()
    const [confirmLoading, setConfirmLoading] = useState(false)
    const form = useForm({ mode: 'onChange', defaultValues: getFormValues(report) })

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = form

    const onSubmit = async (data) => {
        setConfirmLoading(true)
        const { error } = await supabase
            .from('Note')
            .update([{ text: data.text }])
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
