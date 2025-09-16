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
import FormTextArea from '../../../../components/hookForm/FormTextArea'
import FormDatePicker from '../../../../components/hookForm/FormDatePicker'
import { useWatch } from 'react-hook-form'
import FormCheckbox from '../../../../components/hookForm/FormCheckbox'

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
            <FormTextArea
                name="annotation"
                control={control}
                errors={errors}
                rows={6}
                label={t('reports.report.annotation')}
            />
            <FormCheckbox
                name="not_charging_piecework_wage"
                label={t('reports.report.notChargingPieceworkWage')}
                control={control}
                errors={errors}
            />
        </>
    )
}
export default FormReportFields
