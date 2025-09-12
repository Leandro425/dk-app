import { Form, message, Modal } from 'antd'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import FormTextField from '../../../../components/hookForm/FormTextField'
import { useState } from 'react'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { useQueryClient } from '@tanstack/react-query'
import FormTextArea from '../../../../components/hookForm/FormTextArea'
import FormSelect from '../../../../components/hookForm/FormSelect'
import { getEmployeesSelectOptions } from '../../../../utils/supabaseQuery'

const AddReportModal = ({ open, onClose }) => {
    const { t } = useTranslation()
    const { supabase } = useSupabaseContext()
    const queryClient = useQueryClient()
    const [messageApi, contextHolder] = message.useMessage()
    const [confirmLoading, setConfirmLoading] = useState(false)
    const form = useForm({ mode: 'onChange', defaultValues: { text: '', annotation: '' } })

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = form

    const onSubmit = async (data) => {
        setConfirmLoading(true)
        const { error } = await supabase.from('Note').insert([{ text: data.text }])
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

export default AddReportModal
