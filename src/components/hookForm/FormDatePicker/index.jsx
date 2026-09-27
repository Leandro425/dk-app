import { Form, DatePicker } from 'antd'

import { Controller, useFormContext } from 'react-hook-form'

const FormDatePicker = ({ name, label = '', required = false, rules = {}, help, validateStatus }) => {
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
                    <DatePicker
                        onChange={(range) => onChange(range)}
                        value={value}
                        picker="date"
                        format={'DD.MM.YYYY'}
                        style={{ width: '100%' }}
                    />
                </Form.Item>
            )}
        />
    )
}

export default FormDatePicker
