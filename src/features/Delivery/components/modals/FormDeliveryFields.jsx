import { useTranslation } from 'react-i18next'

import useSupabaseContext from '../../../../context/supabase/supabaseContext'

import FormInputNumber from '../../../../components/hookForm/FormInputNumber'
import FormTextArea from '../../../../components/hookForm/FormTextArea'

import FormDatePicker from '../../../../components/hookForm/FormDatePicker'
import FormOrderSelect from '../../../../components/hookForm/FormOrderSelect'
import FormArticleSelect from '../../../../components/hookForm/FormArticleSelect'
import FormFieldSelect from '../../../../components/hookForm/FormFieldSelect'

const FormDeliveryFields = ({ control, errors, enabledSelects = false }) => {
    const { supabase } = useSupabaseContext()
    const { t } = useTranslation()

    return (
        <>
            <FormDatePicker
                name="date"
                label={t('deliveries.delivery.date')}
                control={control}
                errors={errors}
                required
            />
            <FormOrderSelect
                name="order"
                supabase={supabase}
                control={control}
                errors={errors}
                label={t('deliveries.delivery.order')}
                enabled={enabledSelects}
            />
            <FormArticleSelect
                name="article"
                supabase={supabase}
                control={control}
                errors={errors}
                label={t('deliveries.delivery.article')}
                required
                enabled={enabledSelects}
            />
            <FormFieldSelect
                name="field"
                supabase={supabase}
                control={control}
                errors={errors}
                label={t('deliveries.delivery.field')}
                required
                enabled={enabledSelects}
            />
            <FormInputNumber
                name="quantity"
                control={control}
                errors={errors}
                label={t('deliveries.delivery.quantity')}
                required
            />
            <FormTextArea
                name="annotation"
                control={control}
                errors={errors}
                rows={6}
                label={t('deliveries.delivery.annotation')}
            />
        </>
    )
}
export default FormDeliveryFields
