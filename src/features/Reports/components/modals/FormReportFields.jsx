import { useTranslation } from 'react-i18next'
import {
    getArticleSelectOptions,
    getEmployeeSelectOptions,
    getFieldSelectOptions,
    getStaffGroupSelectOptions,
} from '../../../../utils/supabaseQuery'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import FormSelect from '../../../../components/hookForm/FormSelect'
import FormInputNumber from '../../../../components/hookForm/FormInputNumber'
import FormTimeRangePicker from '../../../../components/hookForm/FormTimeRangePicker'
import FormTextArea from '../../../../components/hookForm/FormTextArea'
import FormDatePicker from '../../../../components/hookForm/FormDatePicker'
import { useWatch } from 'react-hook-form'

const FormReportFields = ({ control, errors, enabledSelects = false }) => {
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
                label={t('reports.report.staffGroup')}
                required
                enabled={enabledSelects}
            />
            <FormSelect
                name="employee"
                queryKey={['employees', currentStaffgroup]}
                supabaseQuery={() => getEmployeeSelectOptions(supabase, currentStaffgroup)}
                control={control}
                errors={errors}
                label={t('reports.report.employee')}
                required
                enabled={enabledSelects}
            />
            <FormDatePicker
                name="date"
                label={t('reports.report.date')}
                control={control}
                errors={errors}
                required
            />
            <FormSelect
                name="article"
                queryKey={['articles']}
                supabaseQuery={() => getArticleSelectOptions(supabase)}
                control={control}
                errors={errors}
                label={t('reports.report.article')}
                required
                enabled={enabledSelects}
            />
            <FormSelect
                name="field"
                queryKey={['fields']}
                supabaseQuery={() => getFieldSelectOptions(supabase)}
                control={control}
                errors={errors}
                label={t('reports.report.field')}
                required
                enabled={enabledSelects}
            />
            <FormInputNumber
                name="quantity"
                control={control}
                errors={errors}
                label={t('reports.report.quantity')}
                required
            />
            <FormTimeRangePicker
                name="timeRange"
                label={t('reports.report.timeRange')}
                control={control}
                errors={errors}
            />
            <FormTextArea
                name="annotation"
                control={control}
                errors={errors}
                rows={6}
                label={t('reports.report.annotation')}
            />
        </>
    )
}
export default FormReportFields
