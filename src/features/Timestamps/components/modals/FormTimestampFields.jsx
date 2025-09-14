import { Flex } from 'antd'
import { useTranslation } from 'react-i18next'
import { getEmployeeSelectOptions, getStaffGroupSelectOptions } from '../../../../utils/supabaseQuery'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import FormSelect from '../../../../components/hookForm/FormSelect'
import FormInputNumber from '../../../../components/hookForm/FormInputNumber'
import FormTimeRangePicker from '../../../../components/hookForm/FormTimeRangePicker'
import FormTextArea from '../../../../components/hookForm/FormTextArea'

import { useWatch } from 'react-hook-form'
import FormDatePicker from '../../../../components/hookForm/FormDatePicker'

const FormTimestampFields = ({ control, errors, enabledSelects = false }) => {
    const { supabase } = useSupabaseContext()
    const { t } = useTranslation()

    const currentStaffgroup =
        useWatch({
            control,
            name: 'staffGroup',
        }) || null

    return (
        <>
            <FormSelect
                name="staffGroup"
                queryKey={['staffGroups']}
                supabaseQuery={() => getStaffGroupSelectOptions(supabase)}
                control={control}
                errors={errors}
                label={t('timestamps.timestamp.staffGroup')}
                enabled={enabledSelects}
            />
            <FormSelect
                name="employee"
                queryKey={['employees', currentStaffgroup]}
                supabaseQuery={() => getEmployeeSelectOptions(supabase, currentStaffgroup)}
                control={control}
                errors={errors}
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
