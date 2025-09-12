import { Form, Input } from 'antd'

import { Controller, useFormContext } from 'react-hook-form'

const ControlledTextField = ({ name, label = '', required = false, rules = {}, type = 'text' }) => {
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
                    <Input
                        onChange={(e) => onChange(e.target.value)}
                        value={value}
                        placeholder={label}
                        type={type}
                        size="small"
                        required={required}
                    />
                </Form.Item>
            )}
        />
    )
}

export default ControlledTextField
