import { Button, Divider, Flex, Form, message, Modal, Typography } from 'antd'
import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'

import useSupervisorContext from '../../../../context/user/supervisorContext'
import FormStaffGroupSelect from '../../../../components/hookForm/FormStaffGroupSelect'
import FormOrderSelect from '../../../../components/hookForm/FormOrderSelect'
import FormArticleSelect from '../../../../components/hookForm/FormArticleSelect'
import FormFieldSelect from '../../../../components/hookForm/FormFieldSelect'
import FormDatePicker from '../../../../components/hookForm/FormDatePicker'
import FormBaseSelectWithoutQuery from '../../../../components/hookForm/FormBaseSelectWithoutQuery'
import FormCheckbox from '../../../../components/hookForm/FormCheckbox'

import FormInputNumber from '../../../../components/hookForm/FormInputNumber'
import FormTextArea from '../../../../components/hookForm/FormTextArea'
import { CloseOutlined } from '@ant-design/icons'

const getFormValues = () => {
    return {
        date: dayjs(),
        field: null,
        article: null,
        order: null,
        quantity: '',
        annotation: '',
        special_feature: null,
        reports: [],
    }
}

const AddGroupReportModal = ({ open, onClose }) => {
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
        setValue,
    } = form

    const { fields, remove } = useFieldArray({
        control,
        name: 'reports',
    })

    const onSubmit = async (data) => {
        setConfirmLoading(true)

        // Insert multiple reports
        const reports = data.reports.map((report) => ({
            employee_id: report.employee,
            date: data.date.format('YYYY-MM-DD'),
            field_id: data.field,
            article_id: data.article,
            order_id: data.order,
            quantity: report.quantity,
            created_by_id: supervisor.id,
            special_feature: data.special_feature,
            annotation: data.annotation,
            not_charging_piecework_wage: report.not_charging_piecework_wage,
        }))

        if (reports.length === 0) {
            messageApi.open({
                type: 'error',
                content: t('reports.messages.errorOccurred'),
                duration: 3,
            })
            setConfirmLoading(false)
            return
        }

        const { error } = await supabase.from('report').insert(reports) // Insert all reports at once

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

    const currentStaffGroup =
        useWatch({
            control,
            name: 'staffGroup',
        }) || null

    const enabledSelects = open

    useEffect(() => {
        if (!currentStaffGroup) {
            setValue('reports', [])
        } else {
            const query = supabase
                .from('employee')
                .select('*')
                .eq('staff_group_id', currentStaffGroup)
                .order('staff_number', { ascending: true })
            query.then(({ data, error }) => {
                if (error) {
                    messageApi.open({
                        type: 'error',
                        content: t('common.messages.errorOccurred'),
                        duration: 3,
                    })
                } else {
                    const reportEntries = data.map((emp) => ({
                        employee: emp.id,
                        employee_label: emp.staff_number + ' | ' + emp.firstname + ' ' + emp.lastname,
                        quantity: '',
                        not_charging_piecework_wage: false,
                    }))
                    setValue('reports', reportEntries)
                }
            })
        }
    }, [currentStaffGroup, setValue, supabase, messageApi, t])

    return (
        <FormProvider {...form}>
            {contextHolder}
            <Form layout="vertical">
                <Modal
                    title={t('reports.actions.addGroup')}
                    open={open}
                    onOk={handleSubmit(onSubmit)}
                    confirmLoading={confirmLoading}
                    onCancel={onClose}
                    okButtonProps={{ disabled: !isDirty || !isValid || confirmLoading || fields.length === 0 }}
                    width={850}
                >
                    <FormStaffGroupSelect
                        name="staffGroup"
                        supabase={supabase}
                        control={control}
                        errors={errors}
                        label={t('reports.report.staffGroup')}
                        enabled={enabledSelects}
                    />
                    <Flex
                        gap={16}
                        flex={1}
                    >
                        <Flex
                            vertical
                            gap={8}
                            flex={1}
                            style={{ minWidth: 0 }}
                        >
                            <FormDatePicker
                                name="date"
                                label={t('reports.report.date')}
                                control={control}
                                errors={errors}
                                required
                            />
                            <FormOrderSelect
                                name="order"
                                supabase={supabase}
                                control={control}
                                errors={errors}
                                label={t('reports.report.order')}
                                enabled={enabledSelects}
                            />
                        </Flex>
                        <Flex
                            vertical
                            gap={8}
                            flex={1}
                            style={{ minWidth: 0 }}
                        >
                            <FormArticleSelect
                                name="article"
                                supabase={supabase}
                                control={control}
                                errors={errors}
                                label={t('reports.report.article')}
                                required
                                enabled={enabledSelects}
                            />
                            <FormFieldSelect
                                name="field"
                                supabase={supabase}
                                control={control}
                                errors={errors}
                                label={t('reports.report.field')}
                                required
                                enabled={enabledSelects}
                            />
                        </Flex>
                        <Flex
                            vertical
                            gap={8}
                            flex={1}
                            style={{ minWidth: 0 }}
                        >
                            <FormBaseSelectWithoutQuery
                                name="special_feature"
                                control={control}
                                errors={errors}
                                label={t('reports.report.specialFeature')}
                                options={[{ label: t('reports.report.specialFeatures.barShears'), value: 'barShears' }]}
                            />
                        </Flex>
                    </Flex>
                    <FormTextArea
                        name="annotation"
                        control={control}
                        errors={errors}
                        rows={3}
                        label={t('reports.report.annotation')}
                    />
                    <Divider />
                    {fields.map((field, index) => (
                        <Flex
                            key={field.id}
                            vertical
                            gap={0}
                        >
                            <Flex
                                gap={16}
                                flex={1}
                            >
                                <Flex
                                    flex={1}
                                    gap={16}
                                >
                                    <Typography.Text style={{ fontWeight: 'bold', minWidth: 200, marginTop: 5 }}>
                                        {field.employee_label}
                                    </Typography.Text>
                                </Flex>
                                <FormInputNumber
                                    name={`reports.${index}.quantity`}
                                    control={control}
                                    errors={errors}
                                    label={t('reports.report.quantity')}
                                    required
                                    layout="horizontal"
                                />
                                <FormCheckbox
                                    name={`reports.${index}.not_charging_piecework_wage`}
                                    control={control}
                                    errors={errors}
                                    label={t('reports.report.notChargingPieceworkWage')}
                                />
                                <Button
                                    type="text"
                                    onClick={() => remove(index)}
                                    icon={<CloseOutlined />}
                                />
                            </Flex>
                            {index < fields.length - 1 && <Divider style={{ margin: '0px 0px 24px' }} />}
                        </Flex>
                    ))}
                </Modal>
            </Form>
        </FormProvider>
    )
}

export default AddGroupReportModal
