import { useTranslation } from 'react-i18next'
import { getArticleSelectOptions, getFieldSelectOptions, getOrderSelectOptions } from '../../../../utils/supabaseQuery'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import FormSelect from '../../../../components/hookForm/FormSelect'
import FormInputNumber from '../../../../components/hookForm/FormInputNumber'
import FormTextArea from '../../../../components/hookForm/FormTextArea'

import FormDatePicker from '../../../../components/hookForm/FormDatePicker'

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
            <FormSelect
                name="order"
                queryKey={['orders']}
                supabaseQuery={() => getOrderSelectOptions(supabase)}
                control={control}
                errors={errors}
                label={t('deliveries.delivery.order')}
                enabled={enabledSelects}
            />
            <FormSelect
                name="article"
                queryKey={['articles']}
                supabaseQuery={() => getArticleSelectOptions(supabase)}
                control={control}
                errors={errors}
                label={t('deliveries.delivery.article')}
                required
                enabled={enabledSelects}
            />
            <FormSelect
                name="field"
                queryKey={['fields']}
                supabaseQuery={() => getFieldSelectOptions(supabase)}
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
