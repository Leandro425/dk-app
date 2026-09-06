import { useTranslation } from 'react-i18next'

import useSupabaseContext from '../../../../context/supabase/supabaseContext'

import FormTextArea from '../../../../components/hookForm/FormTextArea'

import FormDatePicker from '../../../../components/hookForm/FormDatePicker'
import FormCustomerSelect from '../../../../components/hookForm/FormCustomerSelect'
import FormBaseSelectWithoutQuery from '../../../../components/hookForm/FormBaseSelectWithoutQuery'
import { getLanguageOptions } from '../../../../config/languages'

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
            <FormCustomerSelect
                name="customer"
                supabase={supabase}
                control={control}
                errors={errors}
                label={t('deliveries.delivery.customer')}
                enabled={enabledSelects}
            />
            <FormBaseSelectWithoutQuery
                name="pdf_language"
                label={t('deliveries.delivery.language')}
                options={getLanguageOptions(t)}
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
