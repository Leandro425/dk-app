import { useQuery } from '@tanstack/react-query'
import { Form, Select } from 'antd'

import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

const FormSelect = ({
    name,
    label = '',
    required = false,
    rules = {},
    queryKey = [],
    supabaseQuery,
    enabled = false,
}) => {
    const { control } = useFormContext()
    const { t } = useTranslation()

    const {
        data: options,
        isLoading,
        isFetching,
        isError,
    } = useQuery({
        queryKey,
        queryFn: supabaseQuery,
        enabled: !!supabaseQuery && enabled,
    })
    return (
        <Controller
            name={name}
            control={control}
            rules={{
                required,
                ...rules,
            }}
            render={({ field: { onChange, value } }) => (
                <Form.Item
                    label={label}
                    required={required}
                >
                    <Select
                        showSearch
                        loading={isLoading || isFetching}
                        notFoundContent={isError ? t('common.messages.errorOccurred') : t('common.placeholders.noData')}
                        placeholder={t('common.placeholders.selectOption')}
                        value={value}
                        onChange={(value) => onChange(value)}
                        options={options}
                    />
                </Form.Item>
            )}
        />
    )
}

export default FormSelect
