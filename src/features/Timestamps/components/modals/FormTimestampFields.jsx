import { Flex } from 'antd'
import { useTranslation } from 'react-i18next'

import useSupabaseContext from '../../../../context/supabase/supabaseContext'

import FormInputNumber from '../../../../components/hookForm/FormInputNumber'
import FormTimeRangePicker from '../../../../components/hookForm/FormTimeRangePicker'
import FormTextArea from '../../../../components/hookForm/FormTextArea'

import { useWatch } from 'react-hook-form'
import FormDatePicker from '../../../../components/hookForm/FormDatePicker'
import FormStaffGroupSelect from '../../../../components/hookForm/FormStaffGroupSelect'
import FormEmployeeSelect from '../../../../components/hookForm/FormEmployeeSelect'
import FormBaseSelectWithoutQuery from '../../../../components/hookForm/FormBaseSelectWithoutQuery'

const FormTimestampFields = ({ control, errors, enabledSelects = false }) => {
    const { supabase } = useSupabaseContext()
    const { t } = useTranslation()

    const currentStaffGroup =
        useWatch({
            control,
            name: 'staffGroup',
        }) || null

    return (
        <>
            <FormStaffGroupSelect
                name="staffGroup"
                supabase={supabase}
                control={control}
                errors={errors}
                label={t('timestamps.timestamp.staffGroup')}
                enabled={enabledSelects}
            />
            <FormEmployeeSelect
                name="employee"
                supabase={supabase}
                control={control}
                errors={errors}
                staffgroup={currentStaffGroup}
                label={t('timestamps.timestamp.employee')}
                required
                enabled={enabledSelects}
            />
            <FormDatePicker
                name="date"
                label={t('timestamps.timestamp.date')}
                control={control}
                errors={errors}
                required
            />
            <Flex gap={16}>
                <FormTimeRangePicker
                    name="timeRange"
                    label={t('timestamps.timestamp.timeRange')}
                    control={control}
                    errors={errors}
                    required
                />
                <FormInputNumber
                    name="break_in_min"
                    control={control}
                    errors={errors}
                    label={t('timestamps.timestamp.breaktime')}
                    min={0}
                    step={15}
                    addonAfter="min"
                />
            </Flex>
            <FormBaseSelectWithoutQuery
                name="type"
                control={control}
                errors={errors}
                label={t('timestamps.timestamp.type')}
                options={[
                    { label: t('timestamps.timestamp.types.workingTime'), value: 'workingTime' },
                    { label: t('timestamps.timestamp.types.vacation'), value: 'vacation' },
                    { label: t('timestamps.timestamp.types.sickness'), value: 'sickness' },
                ]}
                required
            />
            <FormTextArea
                name="annotation"
                control={control}
                errors={errors}
                rows={6}
                label={t('timestamps.timestamp.annotation')}
            />
        </>
    )
}
export default FormTimestampFields
