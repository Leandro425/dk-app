import { Form, message, Modal } from 'antd'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import FormTextField from '../../../../components/hookForm/FormTextField'
import { useEffect, useState } from 'react'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { useQueryClient } from '@tanstack/react-query'
import FormTextArea from '../../../../components/hookForm/FormTextArea'
import { getEmployeesSelectOptions } from '../../../../utils/supabaseQuery'
import FormSelect from '../../../../components/hookForm/FormSelect'

const getFormValues = (report) => {
    if (!report) return { text: '', annotation: '' }
    return {
        text: report.text || '',
        annotation: report.annotation || '',
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
                    <FormSelect
                        name="employee"
                        queryKey={['employees']}
                        supabaseQuery={() => getEmployeesSelectOptions(supabase)}
                        control={control}
                        errors={errors}
                        label={t('reports.report.employee')}
                        required
                        enabled={open}
                    />
                    <FormTextField
                        name="text"
                        control={control}
                        errors={errors}
                        label={t('common.placeholders.enterText')}
                        required
                    />
                    <FormTextArea
                        name="annotation"
                        control={control}
                        errors={errors}
                        rows={6}
                        label={t('reports.report.annotation')}
                    />
                </Modal>
            </Form>
        </FormProvider>
    )
}

export default EditReportModal
