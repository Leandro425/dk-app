import { Form, Input } from 'antd'

import { Controller, useFormContext } from 'react-hook-form'

// `help` + `validateStatus` show a hint below the field (e.g. a warning that does not block saving).
const FormInput = ({ name, label = '', required = false, rules = {}, type = 'text', help, validateStatus }) => {
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
                    help={help}
                    validateStatus={validateStatus}
                >
                    <Input
                        onChange={(e) => onChange(e.target.value)}
                        value={value ?? ''}
                        placeholder={label}
                        type={type}
                        required={required}
                    />
                </Form.Item>
            )}
        />
    )
}

export default FormInput
