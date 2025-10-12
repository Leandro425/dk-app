import { useTranslation } from 'react-i18next'

import useSupabaseContext from '../../../../context/supabase/supabaseContext'

import FormInputNumber from '../../../../components/hookForm/FormInputNumber'
import FormOrderSelect from '../../../../components/hookForm/FormOrderSelect'
import FormArticleSelect from '../../../../components/hookForm/FormArticleSelect'
import FormFieldSelect from '../../../../components/hookForm/FormFieldSelect'

const FormDeliveryItemFields = ({ control, errors, enabledSelects = false }) => {
    const { supabase } = useSupabaseContext()
    const { t } = useTranslation()

    return (
        <>
            <FormOrderSelect
                name="order"
                supabase={supabase}
                control={control}
                errors={errors}
                label={t('deliveries.items.item.order')}
                enabled={enabledSelects}
            />
            <FormArticleSelect
                name="article"
                supabase={supabase}
                control={control}
                errors={errors}
                label={t('deliveries.items.item.article')}
                required
                enabled={enabledSelects}
            />
            <FormFieldSelect
                name="field"
                supabase={supabase}
                control={control}
                errors={errors}
                label={t('deliveries.items.item.field')}
                required
                enabled={enabledSelects}
            />
            <FormInputNumber
                name="quantity"
                control={control}
                errors={errors}
                label={t('deliveries.items.item.quantity')}
                required
            />
        </>
    )
}
export default FormDeliveryItemFields
