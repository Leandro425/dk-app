import { useQuery } from '@tanstack/react-query'
import { getOrderSelectOptions } from '../../utils/supabaseQuery'
import { useTranslation } from 'react-i18next'
import { Select } from 'antd'
const OrderSelect = ({ value, onChange, enabled = false }) => {
    const { t } = useTranslation()
    const {
        data: options,
        isLoading,
        isFetching,
        isError,
    } = useQuery({
        queryKey: ['orders'],
        queryFn: getOrderSelectOptions,
        enabled: enabled,
    })

    return (
        <Select
            showSearch
            loading={isLoading || isFetching}
            notFoundContent={isError ? t('common.messages.errorOccurred') : t('common.placeholders.noData')}
            placeholder={t('common.placeholders.selectOption')}
            value={value}
            onChange={(value) => onChange(value)}
            options={options}
            allowClear
        />
    )
}

export default OrderSelect
