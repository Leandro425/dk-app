import { Form, Select } from 'antd'

import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

const FormBaseSelectWithoutQuery = ({ name, label = '', required = false, rules = {}, options = [], style = {} }) => {
    const { control } = useFormContext()
    const { t } = useTranslation()

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
                        notFoundContent={t('common.placeholders.noData')}
                        placeholder={t('common.placeholders.selectOption')}
                        value={value}
                        onChange={(value) => onChange(value)}
                        options={options}
                        allowClear
                        style={style}
                    />
                </Form.Item>
            )}
        />
    )
}

export default FormBaseSelectWithoutQuery
