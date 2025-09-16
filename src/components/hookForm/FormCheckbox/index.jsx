import { Checkbox, Form } from 'antd'

import { Controller, useFormContext } from 'react-hook-form'

const FormCheckbox = ({ name, formLabel = '', label = '', required = false, rules = {} }) => {
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
                    label={formLabel}
                    required={required}
                >
                    <Checkbox
                        onChange={(e) => onChange(e.target.checked)}
                        checked={value}
                    >
                        {label}
                    </Checkbox>
                </Form.Item>
            )}
        />
    )
}

export default FormCheckbox
