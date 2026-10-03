import { useQuery } from '@tanstack/react-query'
import { getBatchSelectOptions } from '../../utils/supabaseQuery'
import { useTranslation } from 'react-i18next'
import { Select } from 'antd'
import { useMemo } from 'react'

// `type` limits the list to 'field' or 'purchase' batches (reports only take fields).
// `includeArchived` also lists archived batches (e.g. for filtering statistics over past data).
const BatchSelect = ({
    supabase,
    value,
    onChange,
    enabled = false,
    placeholder,
    type = null,
    includeArchived = false,
}) => {
    const { t } = useTranslation()
    const {
        data: options,
        isLoading,
        isFetching,
        isError,
    } = useQuery({
        queryKey: ['batches', 'select'],
        queryFn: () => getBatchSelectOptions(supabase),
        enabled: enabled,
    })

    // Archived batches are only listed when already selected.
    const visibleOptions = useMemo(
        () =>
            options?.filter(
                (option) =>
                    (!type || option.type === type) &&
                    (includeArchived || option.active !== false || option.value === value)
            ),
        [options, value, type, includeArchived]
    )

    return (
        <Select
            showSearch
            loading={isLoading || isFetching}
            notFoundContent={isError ? t('common.messages.errorOccurred') : t('common.placeholders.noData')}
            placeholder={placeholder || t('common.placeholders.selectOption')}
            value={value}
            onChange={(value) => onChange(value)}
            options={visibleOptions}
            filterOption={(input, option) => (option?.search ?? '').includes(input.toLowerCase())}
            style={{ width: '100%' }}
            allowClear
        />
    )
}

export default BatchSelect
