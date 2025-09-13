import { Form, InputNumber } from 'antd'

import { Controller, useFormContext } from 'react-hook-form'

const FormInputNumber = ({ name, label = '', required = false, rules = {}, ...props }) => {
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
                    <InputNumber
                        onChange={(value) => onChange(value)}
                        value={value}
                        required={required}
                        style={{ width: '100%' }}
                        {...props}
                    />
                </Form.Item>
            )}
        />
    )
}

export default FormInputNumber
