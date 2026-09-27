import { AutoComplete, Form } from 'antd'

import { Controller, useFormContext } from 'react-hook-form'

/** Free text input that suggests `suggestions` (strings) while typing. */
const FormAutoComplete = ({ name, label = '', required = false, rules = {}, suggestions = [] }) => {
    const { control } = useFormContext()

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
                    <AutoComplete
                        value={value}
                        onChange={(value) => onChange(value)}
                        options={suggestions.map((suggestion) => ({ value: suggestion }))}
                        filterOption={(input, option) =>
                            (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        placeholder={label}
                        allowClear
                    />
                </Form.Item>
            )}
        />
    )
}

export default FormAutoComplete
