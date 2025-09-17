import { useQuery } from '@tanstack/react-query'
import { getArticleSelectOptions } from '../../utils/supabaseQuery'
import { useTranslation } from 'react-i18next'
import { Select } from 'antd'
const ArticleSelect = ({ supabase, value, onChange, enabled = false, placeholder }) => {
    const { t } = useTranslation()
    const {
        data: options,
        isLoading,
        isFetching,
        isError,
    } = useQuery({
        queryKey: ['articles'],
        queryFn: () => getArticleSelectOptions(supabase),
        enabled: enabled,
    })

    return (
        <Select
            showSearch
            loading={isLoading || isFetching}
            notFoundContent={isError ? t('common.messages.errorOccurred') : t('common.placeholders.noData')}
            placeholder={placeholder || t('common.placeholders.selectOption')}
            value={value}
            onChange={(value) => onChange(value)}
            options={options}
            allowClear
        />
    )
}

export default ArticleSelect
