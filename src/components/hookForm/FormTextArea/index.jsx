import { Form, Input } from 'antd'

import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

const FormTextArea = ({ name, label = '', required = false, rules = {}, rows = 4 }) => {
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
                    <Input.TextArea
                        onChange={(e) => onChange(e.target.value)}
                        value={value}
                        placeholder={t('common.placeholders.enterText')}
                        required={required}
                        rows={rows}
                    />
                </Form.Item>
            )}
        />
    )
}

export default FormTextArea
