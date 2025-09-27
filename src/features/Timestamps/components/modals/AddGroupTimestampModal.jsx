import { Button, Divider, Flex, Form, message, Modal, Typography } from 'antd'
import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'

import useSupervisorContext from '../../../../context/user/supervisorContext'
import FormStaffGroupSelect from '../../../../components/hookForm/FormStaffGroupSelect'

import FormInputNumber from '../../../../components/hookForm/FormInputNumber'
import FormTextArea from '../../../../components/hookForm/FormTextArea'
import { CloseOutlined } from '@ant-design/icons'
import FormTimeRangePicker from '../../../../components/hookForm/FormTimeRangePicker'
const formatTimeString = 'HH:mm'
const getFormValues = () => {
    return {
        date: dayjs(),
        annotation: '',
        timestamps: [],
    }
}

const AddGroupTimestampModal = ({ open, onClose }) => {
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
        name: 'timestamps',
    })

    const onSubmit = async (data) => {
        setConfirmLoading(true)

        // Insert multiple timestamps
        const timestamps = data.timestamps.map((timestamp) => ({
            employee_id: timestamp.employee,
            date: data.date.format('YYYY-MM-DD'),
            start_time:
                timestamp.timeRange && timestamp.timeRange[0] ? timestamp.timeRange[0].format(formatTimeString) : null,
            end_time:
                timestamp.timeRange && timestamp.timeRange[1] ? timestamp.timeRange[1].format(formatTimeString) : null,
            break_in_min: timestamp.break_in_min ? parseFloat(timestamp.break_in_min) : null,
            created_by_id: supervisor.id,
            annotation: data.annotation,
        }))

        if (timestamps.length === 0) {
            messageApi.open({
                type: 'error',
                content: t('timestamps.messages.errorOccurred'),
                duration: 3,
            })
            setConfirmLoading(false)
            return
        }

        const { error } = await supabase.from('timestamp').insert(timestamps) // Insert all timestamps at once

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

    const currentStaffGroup =
        useWatch({
            control,
            name: 'staffGroup',
        }) || null

    const enabledSelects = open

    useEffect(() => {
        if (!currentStaffGroup) {
            setValue('timestamps', [])
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
                    const imestampEntries = data.map((emp) => ({
                        employee: emp.id,
                        employee_label: emp.staff_number + ' | ' + emp.firstname + ' ' + emp.lastname,
                        timeRange: [null, null],
                        break_in_min: null,
                    }))
                    setValue('timestamps', imestampEntries)
                }
            })
        }
    }, [currentStaffGroup, setValue, supabase, messageApi, t])

    return (
        <FormProvider {...form}>
            {contextHolder}
            <Form layout="vertical">
                <Modal
                    title={t('timestamps.actions.addGroup')}
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
                        label={t('timestamps.timestamp.staffGroup')}
                        enabled={enabledSelects}
                    />
                    <Flex
                        gap={16}
                        flex={1}
                    ></Flex>
                    <FormTextArea
                        name="annotation"
                        control={control}
                        errors={errors}
                        rows={3}
                        label={t('timestamps.timestamp.annotation')}
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
                                <Flex gap={16}>
                                    <FormTimeRangePicker
                                        name={`timestamps.${index}.timeRange`}
                                        label={t(`timestamps.timestamp.timeRange`)}
                                        control={control}
                                        errors={errors}
                                        required
                                    />
                                    <FormInputNumber
                                        name={`timestamps.${index}.break_in_min`}
                                        control={control}
                                        errors={errors}
                                        label={t(`timestamps.timestamp.breaktime`)}
                                        min={0}
                                        step={15}
                                        addonAfter="min"
                                    />
                                </Flex>
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

export default AddGroupTimestampModal
