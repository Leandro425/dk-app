import { useTranslation } from 'react-i18next'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import FormInputNumber from '../../../../components/hookForm/FormInputNumber'
import FormTextArea from '../../../../components/hookForm/FormTextArea'
import FormDatePicker from '../../../../components/hookForm/FormDatePicker'
import { useWatch } from 'react-hook-form'
import FormCheckbox from '../../../../components/hookForm/FormCheckbox'
import FormOrderSelect from '../../../../components/hookForm/FormOrderSelect'
import FormArticleSelect from '../../../../components/hookForm/FormArticleSelect'
import FormFieldSelect from '../../../../components/hookForm/FormFieldSelect'
import FormEmployeeSelect from '../../../../components/hookForm/FormEmployeeSelect'
import FormStaffGroupSelect from '../../../../components/hookForm/FormStaffGroupSelect'

const FormReportFields = ({ control, errors, enabledSelects = false }) => {
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
                label={t('reports.report.staffGroup')}
                enabled={enabledSelects}
            />
            <FormEmployeeSelect
                name="employee"
                supabase={supabase}
                control={control}
                errors={errors}
                staffgroup={currentStaffGroup}
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
            <FormOrderSelect
                name="order"
                supabase={supabase}
                control={control}
                errors={errors}
                label={t('reports.report.order')}
                enabled={enabledSelects}
            />
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
